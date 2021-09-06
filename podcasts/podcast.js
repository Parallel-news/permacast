/**
 * SWC used as first level data registery for
 * Arweave hosted podcasts.
 * 
 * The current contract represents a basic PoC
 * 
 * contributor(s): charmful0x
 * 
 * Lisence: MIT
**/



export async function handle(state, action) {
	const input = action.input
	const caller = action.caller
	const podcasts = state.podcasts

	const contractID = SmartWeave.contract.id
	const contractTxObject = await SmartWeave.unsafeClient.transactions.get(contractID)
	const base64Owner = contractTxObject["owner"]
	const contractOwner = await SmartWeave.unsafeClient.wallets.ownerToAddress(base64Owner)

	if (input.function === "createPodcast") {
		const name = input.name
		const desc = input.desc
		const cover = input.cover
		const pid = SmartWeave.transaction.id

		const tagsMap = new Map();

		if (caller !== contractOwner ) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (typeof name !== "string" || name.length > 50) {
			throw new ContractError(`uncorrect name limit`)
		}

		if (typeof desc !== "string" || desc.length > 500) {
			throw new ContractError(`description too long`)
		}

		// validate the cover TXID. it should be an Arweave data
		// TX having image/x mime type

		// <------------------------
		if (typeof cover !== "string" || cover.length !== 43) {
			throw new ContractError(`uncorrect cover format`)
		}

		const coverTx = await SmartWeave.unsafeClient.transactions.get(cover)
		const tags = coverTx.get("tags")

		for (let tag of tags) {
			const key = tag.get("name", {decode: true, string: true} )
			const value = tag.get("value", {decode: true, string: true})
			tagsMap.set(key, value)
		}

		if (! tagsMap.has("Content-Type")) {
			throw new ContractError(`uncorrect data transaction`)
		}

		if (! tagsMap.get("Content-Type").startsWith("image/") ) {
			throw new ContractError(`invalid mime type`)
		}

		// ------------------------>

		podcasts.push( {
			"pid": pid,
			"index": _getPodcastIndex(), // id equals the index of the podacast obj in the podcasts array
			"podcastName": name,
			"description": desc,
			"cover": cover,
			"episodes":[],
			"logs": [pid]
		} )

		return { state }
	}

	if ( input.function === "addEpisode") {
		const index = input.index // podcast index
		const name = input.name
		const audio = input.audio
		const desc = input.desc

		const tagsMap = new Map()

		if (caller !== contractOwner ) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! Number.isInteger(index) ) {
			throw new ContractError(`index must be an integer`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} not found`)
		}
		

		if (typeof name !== "string" || name.length > 50) {
			throw new ContractError(`uncorrect name limit`)
		}

		if (typeof desc !== "string" || desc.length > 250) {
			throw new ContractError(`description too long`)
		}

		if (typeof audio !== "string" || audio.length !== 43) {
			throw new ContractError(`invalid audio TX`)
		}

		const audioTx = await SmartWeave.unsafeClient.transactions.get(audio)
		const tags = audioTx.get("tags")

		for (let tag of tags) {
			const key = tag.get("name", {decode: true, string: true} )
			const value = tag.get("value", {decode: true, string: true})
			tagsMap.set(key, value)
		}

		if (! tagsMap.has("Content-Type")) {
			throw new ContractError(`uncorrect data transaction`)
		}

		if (! tagsMap.get("Content-Type").startsWith("audio/") ) {
			throw new ContractError(`invalid mime type`)
		}

		podcasts[index]["episodes"].push({
			"eid": SmartWeave.transaction.id, // episode TXID
			"childOf": index,
			"episodeName": name,
			"description": desc,
			"audioTx": audio,
			"uploadedAt": SmartWeave.block.height,
			"logs": [SmartWeave.transaction.id]
		})

		return { state }

	}

	
	// PODCAST ACTIONS:

	if (input.function === "deletePodcast") {
		const index = input.index //podcast index 

		if ( caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}
		
		if (! Number.isInteger(index) ) {
			throw new ContractError(`index must be an integer`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} does not exist`)
		}

		podcasts.splice(index, 1)

		return { state }
	}

	if (input.function === "editPodcastName") {
		const index = input.index
		const name = input.name
		
		const actionTx = SmartWeave.transaction.id

		if ( caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! Number.isInteger(index) ) {
			throw new ContractError(`index must be an integer`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} does not exist`)
		}

		if (typeof name !== "string") {
			throw new ContractError(`invalid name type`)
		}

		if ( name.length < 3 || name.length > 50 ) {
			throw new ContractError(`the name does not meet the name limits`)
		}

		if ( podcasts[index]["podcastName"] ===  name) {
			throw new ContractError(`old name and new name cannot be equals`)
		}

		podcasts[index]["podcastName"] = name
		podcasts[index]["logs"].push(actionTx)

		return { state }
	}

	if (input.function === "editPodcastDesc") {
		const index = input.index
		const desc = input.desc
		
		const actionTx = SmartWeave.transaction.id

		if ( caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! Number.isInteger(index) ) {
			throw new ContractError(`index must be an integer`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} does not exist`)
		}

		if ( typeof desc !== "string" ) {
			throw new ContractError(`invalid description type`)
		}

		if ( desc.length > 250 ) {
			throw new ContractError(`description length too high`)
		}

		if ( podcasts[index]["description"] === desc ) {
			throw new ContractError(`old description and new description cannot be equals`)
		}

		podcasts[index]["description"] = desc
		podcasts[index]["logs"].push(actionTx)

		return { state }

	}

	if (input.function === "editPodcastCover") {
		const index = input.index
		const cover = input.cover
		
		const tagsMap = new Map();
		const actionTx = SmartWeave.transaction.id

		if ( caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! Number.isInteger(index) ) {
			throw new ContractError(`index must be an integer`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} does not exist`)
		}

		if (typeof cover !== "string" || cover.length !== 43) {
			throw new ContractError(`uncorrect cover format`)
		}

		const coverTx = await SmartWeave.unsafeClient.transactions.get(cover)
		const tags = coverTx.get("tags")

		for (let tag of tags) {
			const key = tag.get("name", {decode: true, string: true} )
			const value = tag.get("value", {decode: true, string: true})
			tagsMap.set(key, value)
		}

		if (! tagsMap.has("Content-Type")) {
			throw new ContractError(`uncorrect data transaction`)
		}

		if (! tagsMap.get("Content-Type").startsWith("image/") ) {
			throw new ContractError(`invalid mime type`)
		}

		if ( podcasts[index]["cover"] === cover ) {
			throw new ContractError(`old cover and new cover cannot be equals`)
		}

		podcasts[index]["cover"] = cover
		podcasts[index]["logs"].push(actionTx)

		return { state }

	}
	
	// EPISODES ACTIONS:

	if (input.function === "editEpisodeName") {
		const name = input.name
		const index = input.index // podcast index
		const id = input.id // episode index
		
		const actionTx = SmartWeave.transaction.id

		if (caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} not found`)
		}

		if (! podcasts[index]["episodes"][id]) {
			throw new ContractError(`episode having index: ${id} not found`)
		}

		if (typeof name !== "string") {
			throw new ContractError(`invalid name format`)
		}

		if (name.length < 2 || name.length > 50) {
			throw new ContractError(`${name} does not meet the name limits`)
		}

		if ( podcasts[index]["episodes"][id]["episodeName"] === name ) {
			throw new ContractError(`new name and old name cannot be the same`)
		}

		podcasts[index]["episodes"][id]["episodeName"] = name
		podcasts[index]["episodes"][id]["logs"].push(actionTx)

		return { state }
	}

	if (input.function === "editEpisodeDesc") {
		const index = input.index
		const id = input.id
		const desc = input.desc
		
		const actionTx = SmartWeave.transaction.id

		if (caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having index: ${index} not found`)
		}

		if (! podcasts[index]["episodes"][id]) {
			throw new ContractError(`episode having index: ${id} not found`)
		}

		if (typeof desc !== "string") {
			throw new ContractError(`invalid description format`)
		}

		if ( desc.length < 25 || desc.length > 500 ) {
			throw new ContractError(`the description text does not meet the desc limits`)
		}

		if ( podcasts[index]["episodes"][id]["description"] === desc) {
			throw new ContractError(`old description and new description canot be the same`)
		}

		podcasts[index]["episodes"][id]["description"] = desc
		podcasts[index]["episodes"][id]["logs"].push(actionTx)

		return { state }
	}

	if (input.function === "deleteEpisode") {
		const index = input.index
		const id = input.id

		if ( caller !== contractOwner) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! podcasts[index]) {
			throw new ContractError(`podcast having ID: ${index} not found`)
		}

		if (! podcasts[index][id]) {
			throw new ContractError(`episode having index: ${id} not found`)
		}

		podcasts[index]["episodes"].splice(id, 1)

		return { state }
	}
	
	// HELPER FUNCTIONS:
	function _getPodcastIndex() {
		if (podcasts.length === 0) {
			return 0
		}

		return (podcasts.length - 1 )
	}


	throw new ContractError(`unknow function supplied: '${input.function}'`)

}

