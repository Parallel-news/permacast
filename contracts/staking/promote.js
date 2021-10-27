/**
 * SPDX-License-Identifier: MIT
 * 
 * About: Permacast Staking Contract - Stake To Promote
 * Version: Testnet
 * Author: charmful0x
 * 
**/

export async function handle (state, action) {

	const caller = action.caller
	const input = action.input
	// state 
	const proposals = state.proposals
	const balances = state.balances
	const deposits = state.deposits
	const withdrawals = state.withdrawals
	const foreignCalls = state.foreignCalls
	const invocations = state.invocations
	// constants
	const FEE = 1  // a fixed fee to make a proposal
	const $NEWS = "FdY68iYqTvA40U34aXQBBYseGmIUmLV-u57bT7LZWm0" // FCP protocol compatible PST
	// Errors
	const ERROR_INVALID_ARWEAVE_TX = `the provided string is not a valid Arweave TX`;
	const ERROR_PID_DOES_NOT_EXIST = `the supplied podcast ID not found`;
	const ERROR_PID_ALREADY_PROPOSED = `the supplied pid is duplicated`;
	const ERROR_CALLER_NOT_REGISTERED = `the caller has not deposited yet`;
	const ERROR_UNSUFFICIENT_BALANCE = `unsufficient wARN balance`;
	const ERROR_MISSING_REQUIRED_TAG = `the provided TX miss a required TX tag`;
	const ERROR_INVALID_TAG_VALUE = `the TX has an unsupported TX tag`;
	const ERROR_REQUIRED_PARAMETER = `the function has a required patameter`;
	const ERROR_INVALID_NUMBER_TYPE = `only integer type is allowed`;
	const ERROR_NEGATIVE_INTEGER = `only positve integers are allowed`;
	const ERROR_DUPLICATED_TX = `the given deposit TXID is duplicated`;
	const ERROR_INVALID_DEPOSITOR = `TX's owner and caller are not equal`;
	const ERROR_INVALID_DEPOSIT_TX = `the given TXID is not a valid WARN transfer`;
	const ERROR_WARN_QTY_TOO_HIGH = `the given WARN amount for the activity is not valide by the caller's balance`;
	const ERROR_STAKER_NOT_FOUND = `the caller is not found in the proposal's stakes object`;

	// @param pid 	permacast's podcast ID
	if (input.function === "addProposal") {
		const pid = input.pid

		_validatePodcastId(pid);
		_checkCallerState(caller);
		await _validatePodcastTx(pid);

		balances[caller] -= FEE

		proposals.push({
			pid: pid,
			total_staked: 0,
			stakes_per_voter: {}
		})

		return { state }


	}

	// @param tx 	$WARN transfer TXID to this SWC 
	if (input.function === "deposit") {
		const tx = input.tx

		await _validateDepositTransaction(tx, caller);
		const depositQty = await _getDepositQty(tx);

		if (! balances[caller]) {
			balances[caller] = 0
		};

		balances[caller] += depositQty
		deposits.push(tx)

		return { state }

	}

	if (input.function === "withdraw") {
		const qty = input.qty


		if (! balances[caller]) {
			throw new ContractError(ERROR_CALLER_NOT_REGISTERED)
		};

		_validateWithdrawQty(qty);

		balances[caller] -= qty

	    const invocation = {
	      function: "transfer",
	      target: caller,
	      qty: qty
	    };

	    foreignCalls.push({
	      contract: $NEWS,
	      input: invocation
	    });

	    withdrawals.push(SmartWeave.transaction.id)

    	return { state }

	}

	// @param id 	proposal's index in the state's array
	// @param qty 	$WARN amount to be staked
	if (input.function === "stakeToProposal") {

		const id = input.id 
		const qty = input.qty

		_validateInteger(id, true);
		_validateInteger(qty, false);
		_validateStakingAttempt(caller, qty, id);

		const proposal = proposals[id]

		balances[caller] -= qty 
		proposal["total_staked"] += qty

		if (! proposal["stakes_per_voter"][caller]) {
			proposal["stakes_per_voter"][caller] = 0
		}
		proposal["stakes_per_voter"][caller] += qty

		_updateRanks()

		return { state }

	}

	if (input.function === "unstakeFromProposal") {
		const id = input.id 
		const qty = input.qty 

		_validateInteger(id, true);
		_validateInteger(qty, false);
		_validateUnstakingAttempt(caller, qty, id);

		const proposal = proposals[id]

		balances[caller] += qty 
		proposal["total_staked"] -= qty
		proposal["stakes_per_voter"][caller] -= qty 

		_updateRanks()

		return { state }

	}

	// HELPER FUNCTIONS


	// @param pid 		arbitrary podcast's id
	function _validatePodcastId(pid) {

		if ( typeof pid !== "string" || pid.length !== 43) {
			throw new ContractError(ERROR_INVALID_ARWEAVE_TX)
		}

		if ( proposals.find(podcast => podcast.pid === pid) ) {
			throw new ContractError(ERROR_PID_ALREADY_PROPOSED)
		}
	};

	// @param caller 	arweave address of ther caller
	function _checkCallerState(caller) {

		if (! balances[caller]) {
			throw new ContractError(ERROR_CALLER_NOT_REGISTERED)
		}

		if (balances[caller] < FEE) {
			throw new ContractError(ERROR_UNSUFFICIENT_BALANCE)
		}
	};

	// @param number 	arbitrary number
	// @allowNull 		boolean
	function _validateInteger(number, allowNull) {

		if ( typeof allowNull === "undefined" ) {
			throw new ContractError(ERROR_REQUIRED_PARAMETER)
		}

		if (! Number.isInteger(number) ) {
			throw new ContractError(ERROR_INVALID_NUMBER_TYPE)
		}

		if (allowNull) {
			if (number < 0) {
				throw new ContractError(ERROR_NEGATIVE_INTEGER)
			}
		} else if (number <= 0) {
			throw new ContractError(ERROR_INVALID_NUMBER_TYPE)
		}
	};

	async function _validateDepositTransaction(txid, address) {

		if ( deposits.includes(txid) ) {
			throw new ContractError(ERROR_DUPLICATED_TX)
		}

		const txObject = await SmartWeave.unsafeClient.transactions.get(txid)
		const txOwner = txObject["owner"]
		const ownerAddress = await SmartWeave.unsafeClient.wallets.ownerToAddress(txOwner)

		if (ownerAddress !== address) {
			throw new ContractError(ERROR_INVALID_DEPOSITOR)
		}

		const fcpTxsValidation = await SmartWeave.contracts.readContractState($NEWS, undefined, true)
		const validity = fcpTxsValidation.validity

		if (! validity[txid] ) {
			throw new ContractError(ERROR_INVALID_DEPOSIT_TX)
		}
	};

	async function _getTransactionTagsMap(txid, isForTxInputs) {

		const tagsMap = new Map();

		const depositTransactionObject = await SmartWeave.unsafeClient.transactions.get(txid);
	  const depositTransactionTags = depositTransactionObject.get("tags");

	  for (let tag of depositTransactionTags) {
	    const key = tag.get("name", {decode: true, string: true})
	    const value = tag.get("value", {decode: true, string: true})
	    tagsMap.set(key, value)
	   };

	  if (isForTxInputs) {
	  	if (! tagsMap.has("Input") ) {
	  		throw new ContractError(ERROR_MISSING_REQUIRED_TAG)
	  	}
	  }

	   return tagsMap
	}

	async function _getDepositQty(txid) {

		const tagsMap = await _getTransactionTagsMap(txid, true);

	  const inputObject = JSON.parse( tagsMap.get("Input") );
	  const inputsMap = new Map( Object.entries(inputObject) );

	  _checkMapKeyValue(inputsMap, "qty", void 0);
	  _checkMapKeyValue(inputsMap, "function", "transfer");
	  _checkMapKeyValue(inputsMap, "target", SmartWeave.contract.id)

	  return inputsMap.get("qty")

	};

	function _validateWithdrawQty(qty) {

		if ( (!Number.isInteger(qty)) || (qty <= 0) ) {
			throw new ContractError(ERROR_INVALID_NUMBER_TYPE)
		}

		if (balances[caller] < qty) {
			throw new ContractError(ERROR_UNSUFFICIENT_BALANCE)
		}

	};


	async function _validatePodcastTx(pid) {

		if (typeof pid !== "string" || pid.length !== 43) {
			throw new ContractError(ERROR_INVALID_ARWEAVE_TX)
		}

		
		const tagsMap = await _getTransactionTagsMap(pid, true);
	  const inputObject = JSON.parse( tagsMap.get("Input") );
	  const inputsMap = new Map( Object.entries(inputObject) );

	  _checkMapKeyValue(tagsMap, "App-Name", "SmartWeaveAction");
	  _checkMapKeyValue(tagsMap, "App-Version", "0.3.0");

	  // check for Input object function's value
	  _checkMapKeyValue(inputsMap, "function", "createPodcast")

	};

	function _checkMapKeyValue(map, key, expectedValue) {
		
		// if @param expectedValue === undefined, then
		// the function just checks for key's existence
		if (expectedValue === void 0) {
			if (! map.has(key) ) {
				throw new ContractError(ERROR_MISSING_REQUIRED_TAG)
			}

			return void 0
		}

		if (! map.has(key) ) {
			throw new ContractError(ERROR_MISSING_REQUIRED_TAG)
		}

		if (map.get(key) !== expectedValue) {
			throw new ContractError(ERROR_INVALID_TAG_VALUE)
		}
	};

	function _validateStakingAttempt(caller, qty, id) {

		if (! (caller in balances)) {
			throw new ContractError(ERROR_INVALID_DEPOSITOR)
		}

		if (qty > balances[caller]) {
			throw new ContractError(ERROR_WARN_QTY_TOO_HIGH)
		}

		if (! proposals[id]) {
			throw new ContractError(ERROR_PID_DOES_NOT_EXIST)
		}
	}

	function _validateUnstakingAttempt(caller, qty, id) {

		if (! proposals[id]) {
			throw new ContractError(ERROR_PID_DOES_NOT_EXIST)
		}

		const proposal = proposals[id]

		if (! proposal.stakes_per_voter.caller) {
			throw new ContractError(ERROR_STAKER_NOT_FOUND)
		}

		if (proposal.stakes_per_voter.caller < qty) {
			throw new ContractError(ERROR_WARN_QTY_TOO_HIGH)
		}

	};

	function _updateRanks() {
		proposals.sort( (p1, p2) => p1.total_staked - p2.total_staked)
	}

	throw new ContractError(`unknow function supplied: ${input.function}`)
}

// You can try the displayed version of this SWC @ sxl6QeT4chkJ3th7VUVwiduCbIr9BrQ7j3bXjK5z6cs