/**
 * SWC used as first level data registery for
 * Arweave hosted podcasts.
 *
 * website: permacast.net
 *
 * Contract Version: V2
 * 
 * contributor(s): charmful0x
 *
 * Licence: MIT
 **/

export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;
  const podcasts = state.podcasts;

  // ERRORS List
  const ERROR_INVALID_CALLER =
    "the caller is not allowed to execute this function";
  const ERROR_INVALID_PRIMITIVE_TYPE =
    "the given data is not a corrected primitive type per function";
  const ERROR_INVALID_STRING_LENGTH =
    "the string is out of the allowed length ranges";
  const ERROR_NOT_A_DATA_TX = "the transaction is not an Arweave TX DATA";
  const ERROR_MIME_TYPE = "the given mime type is not supported";
  const ERROR_UNSUPPORTED_LANG = "the given language code is not supported";
  const ERROR_REQUIRED_PARAMETER = "the function still require a parameter";
  const ERROR_INVALID_NUMBER_TYPE = "only inetegers are allowed";
  const ERROR_NEGATIVE_INTEGER =
    "negative integer was supplied when only positive Intare allowed";
  const ERROR_EPISODE_INDEX_NOT_FOUND =
    "there is no episode with the given index";
  const ERROR_PODCAST_INDEX_NOT_FOUND =
    "there is no podcast with the given index";
  const ERROR_OLD_VALUE_EQUAL_TO_NEW = "old valueand new value are equal";

  if (input.function === "createPodcast") {
    const name = input.name;
    const author = input.author;
    const desc = input.desc;
    const lang = input.lang;
    const isExplicit = input.isExplicit;
    const categories = input.categories;
    const email = input.email;
    const cover = input.cover;

    const pid = SmartWeave.transaction.id;

    await _getContractOwner(true, caller);

    _validateStringTypeLen(name, 3, 50);
    _validateStringTypeLen(author, 2, 50);
    _validateStringTypeLen(desc, 10, 750);
    _validateStringTypeLen(email, 0, 320);
    _validateStringTypeLen(categories, 3, 150);
    _validateStringTypeLen(cover, 43, 43);
    _validateStringTypeLen(lang, 2, 2);

    await _validateDataTransaction(cover, "image/");

    if (!["yes", "no"].includes(isExplicit)) {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    podcasts.push({
      pid: pid,
      index: _getPodcastIndex(), // id equals the index of the podacast obj in the podcasts array
      childOf: SmartWeave.contract.id,
      owner: caller,
      podcastName: name,
      author: author,
      email: email,
      description: desc,
      language: lang,
      explicit: isExplicit,
      categories: categories.split(",").map((category) => category.trim()),
      cover: cover,
      episodes: [],
      logs: [pid],
    });

    return { state };
  }

  if (input.function === "addEpisode") {
    const index = input.index; // podcasts index
    const name = input.name;
    const audio = input.audio; // the TXID of 'audio/' data
    const desc = input.desc;

    await _getContractOwner(true, caller);

    _validateStringTypeLen(name, 3, 50);
    _validateStringTypeLen(audio, 43, 43);
    _validateStringTypeLen(desc, 0, 250);
    _validateInteger(index, true);

    const TxMetadata = await _validateDataTransaction(audio, "audio/");

    if (!podcasts[index]) {
      throw new ContractError(ERROR_PODCAST_INDEX_NOT_FOUND);
    }

    podcasts[index]["episodes"].push({
      eid: SmartWeave.transaction.id,
      childOf: index,
      episodeName: name,
      description: desc,
      audioTx: audio,
      audioTxByteSize: Number.parseInt(TxMetadata.size),
      type: TxMetadata.type,
      uploadedAt: SmartWeave.block.timestamp,
      logs: [SmartWeave.transaction.id],
    });

    return { state };
  }

  // PODCAST ACTIONS:

  if (input.function === "editPodcastName") {
    const index = input.index;
    const name = input.name;

    const actionTx = SmartWeave.transaction.id;

    await _getContractOwner(true, caller);
    _validateStringTypeLen(name, 3, 50);
    _validateInteger(index, true);

    if (!podcasts[index]) {
      throw new ContractError(ERROR_PODCAST_INDEX_NOT_FOUND);
    }

    if (podcasts[index]["podcastName"] === name) {
      throw new ContractError(ERROR_OLD_VALUE_EQUAL_TO_NEW);
    }

    podcasts[index]["podcastName"] = name;
    podcasts[index]["logs"].push(actionTx);

    return { state };
  }

  if (input.function === "editPodcastDesc") {
    const index = input.index;
    const desc = input.desc;

    const actionTx = SmartWeave.transaction.id;

    await _getContractOwner(true, caller);
    _validateInteger(index, true);
    _validateStringTypeLen(desc, 10, 750);

    if (!podcasts[index]) {
      throw new ContractError(ERROR_PODCAST_INDEX_NOT_FOUND);
    }

    if (podcasts[index]["description"] === desc) {
      throw new ContractError(ERROR_OLD_VALUE_EQUAL_TO_NEW);
    }

    podcasts[index]["description"] = desc;
    podcasts[index]["logs"].push(actionTx);

    return { state };
  }

  if (input.function === "editPodcastCover") {
    const index = input.index;
    const cover = input.cover;
    const actionTx = SmartWeave.transaction.id;
    const tagsMap = new Map();

    await _getContractOwner(true, caller);
    _validateStringTypeLen(cover, 43, 43);
    _validateInteger(index, true);

    if (!podcasts[index]) {
      throw new ContractError(ERROR_PODCAST_INDEX_NOT_FOUND);
    }

    if (podcasts[index]["cover"] === cover) {
      throw new ContractError(ERROR_OLD_VALUE_EQUAL_TO_NEW);
    }

    await _validateDataTransaction(cover, "image/");

    podcasts[index]["cover"] = cover;
    podcasts[index]["logs"].push(actionTx);

    return { state };
  }

  // EPISODES ACTIONS:

  if (input.function === "editEpisodeName") {
    const name = input.name;
    const index = input.index; //podcast index
    const id = input.id; // episode's index

    const actionTx = SmartWeave.transaction.id;

    await _getContractOwner(true, caller);

    _validateStringTypeLen(name, 2, 50);
    _validateInteger(index, true);
    _validateInteger(id, true);
    _validateEpisodeExistence(index, id);

    if (podcasts[index]["episodes"][id]["episodeName"] === name) {
      throw new ContractError(ERROR_OLD_VALUE_EQUAL_TO_NEW);
    }

    podcasts[index]["episodes"][id]["episodeName"] = name;
    podcasts[index]["episodes"][id]["logs"].push(actionTx);

    return { state };
  }

  if (input.function === "editEpisodeDesc") {
    const index = input.index;
    const id = input.id;
    const desc = input.desc;

    const actionTx = SmartWeave.transaction.id;

    await _getContractOwner(true, caller);

    _validateStringTypeLen(desc, 25, 500);
    _validateInteger(index, true);
    _validateInteger(id, true);
    _validateEpisodeExistence(index, id);

    if (podcasts[index]["episodes"][id]["description"] === desc) {
      throw new ContractError(ERROR_OLD_VALUE_EQUAL_TO_NEW);
    }

    podcasts[index]["episodes"][id]["description"] = desc;
    podcasts[index]["episodes"][id]["logs"].push(actionTx);

    return { state };
  }

  // HELPER FUNCTIONS:
  function _getPodcastIndex() {
    if (podcasts.length === 0) {
      return 0;
    }

    return podcasts.length;
  }

  function _validateStringTypeLen(str, minLen, maxLen) {
    if (typeof str !== "string") {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    if (str.length < minLen || str.length > maxLen) {
      throw new ContractError(ERROR_INVALID_STRING_LENGTH);
    }
  }

  function _validateInteger(number, allowNull) {
    if (typeof allowNull === "undefined") {
      throw new ContractError(ERROR_REQUIRED_PARAMETER);
    }

    if (!Number.isInteger(number)) {
      throw new ContractError(ERROR_INVALID_NUMBER_TYPE);
    }

    if (allowNull) {
      if (number < 0) {
        throw new ContractError(ERROR_NEGATIVE_INTEGER);
      }
    } else if (number <= 0) {
      throw new ContractError(ERROR_INVALID_NUMBER_TYPE);
    }
  }

  async function _getContractOwner(validate, caller) {
    const contractID = SmartWeave.contract.id;
    const contractTxObject = await SmartWeave.unsafeClient.transactions.get(
      contractID
    );
    const base64Owner = contractTxObject["owner"];
    const contractOwner = await SmartWeave.unsafeClient.wallets.ownerToAddress(
      base64Owner
    );

    if (validate && contractOwner !== caller) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

    return contractOwner;
  }

  async function _validateDataTransaction(tx, mimeType) {
    const tagsMap = new Map();
    const transaction = await SmartWeave.unsafeClient.transactions.get(tx);
    const tags = transaction.get("tags");

    for (let tag of tags) {
      const key = tag.get("name", { decode: true, string: true });
      const value = tag.get("value", { decode: true, string: true });
      tagsMap.set(key, value);
    }

    if (!tagsMap.has("Content-Type")) {
      throw new ContractError(ERROR_NOT_A_DATA_TX);
    }

    if (!tagsMap.get("Content-Type").startsWith(mimeType)) {
      throw new ContractError(ERROR_MIME_TYPE);
    }

    return {
      size: transaction.data_size,
      type: tagsMap.get("Content-Type"),
    };
  }

  function _validateEpisodeExistence(index, id) {
    if (!podcasts[index]) {
      throw new ContractError(ERROR_PODCAST_INDEX_NOT_FOUND);
    }

    if (!podcasts[index]["episodes"][id]) {
      throw new ContractError(ERROR_EPISODE_INDEX_NOT_FOUND);
    }
  }

  throw new ContractError("unknow function supplied: ", input.function);
}