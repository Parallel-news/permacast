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
		const podcastID = SmartWeave.transaction.id

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

		if ( podcastID in podcasts ) {
			throw new ContractError(`podcast having ID: ${podcastID} is already registered`)
		}

		podcasts[podcastID] = {

			"podcastName": name,
			"description": desc,
			"cover": cover,
			"episodes":[]
		}

		return { state }
	}

	if ( input.function === "addEpisode") {
		const podcast = input.podcast
		const name = input.name
		const audio = input.audio
		const desc = input.desc

		const tagsMap = new Map()

		if (caller !== contractOwner ) {
			throw new ContractError(`invalid caller. Only ${contractOwner} can perform this action`)
		}

		if (! podcasts[podcast]) {
			throw new ContractError(`podcast having ID: ${podcast} not found`)
		}

		if (typeof name !== "string" || name.length > 50) {
			throw new ContractError(`uncorrect name limit`)
		}

		if (typeof desc !== "string" || desc.length > 250) {
			throw new ContractError(`description too long`)
		}

		if (typeof audio !== "string" || audio.length !== 43)

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

		podcasts[podcast]["episodes"].push({
			"id": SmartWeave.transaction.id,
			"episodeName": name,
			"description": desc,
			"audioTx": audio,
			"uploadedAt": SmartWeave.block.height
		})

		return { state }

	}
}

