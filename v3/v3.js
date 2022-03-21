/**
 * SWC used as first level data registery for
 * Arweave hosted podcasts.
 *
 * version: TESTNET V3
 *
 * website: permacast.net
 * contributor(s): charmful0x
 *
 * Licence: MIT
 **/

export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;
  const podcasts = state.podcasts;
  const maintainers = state.maintainers;
  const superAdmins = state.superAdmins;
  const v2SourceCode = state.v2SourceCode;

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
  const ERROR_MAINTAINER_ALREADY_ADDED =
    "the address has been already added as maintainer";
  const ERROR_MAINTAINER_NOT_FOUND =
    "cannot find a mainatiner with the given address";
  const ERROR_SUPER_ADMIN_ALREADY_ADDED =
    "the given address has been already added as super admin";
  const ERROR_SUPER_ADMIN_NOT_EXIST = "the given address is not a super admin";
  const ERROR_V2_SRC_NOT_VALID = "the given factoryID does not have the V2 SRC";
  const ERROR_MIGRATION_DONE = "the contract has already migrated a V2 state";
  const ERROR_CANNOT_MIGRATE_TO_ACTIVE_FACTORY =
    "this contract has been already activated - cannot override the state";
  const ERROR_STATE_CANNOT_MIGRATE = "error while retrieving the V2 state";
  const ERROR_PID_NOT_FOUND = "cannot find a podcast with the given PID";
  const ERROR_EID_NOT_FOUND = "cannot find an episode with the given EID";
  const ERROR_PID_OF_EID_NOT_FOUND = "cannot find a podcast with the given EID";
  const ERROR_PODCAST_UPLOAD_DUPLICATED =
    "auto-minimal protection from double podcast creation activated";
  const ERROR_EPISODE_UPLOAD_DUPLICATED =
    "auto-minimal protection from double episode uploads activated";

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

    await _isSuperAdmin(true, caller);

    _validateStringTypeLen(name, 2, 500);
    _validateStringTypeLen(author, 2, 150);
    _validateStringTypeLen(desc, 10, 7500);
    _validateStringTypeLen(email, 0, 320);
    _validateStringTypeLen(categories, 1, 300);
    _validateStringTypeLen(cover, 43, 43);
    _validateStringTypeLen(lang, 2, 2);
    // auto-prevent double podcast creation
    _checkPodcastUploadDuplication(name);
    await _validateDataTransaction(cover, "image/");

    if (!["yes", "no"].includes(isExplicit)) {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    podcasts.push({
      pid: pid,
      createdAtBlockheight: SmartWeave.block.height, // V3 metadata
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
    const pid = input.pid; // podcast's PID
    const name = input.name;
    const audio = input.audio; // the TXID of 'audio/' data
    const desc = input.desc;

    await _getMaintainers(true, caller);

    _validateStringTypeLen(name, 3, 500);
    _validateStringTypeLen(audio, 43, 43);
    _validateStringTypeLen(pid, 43, 43);
    _validateStringTypeLen(desc, 0, 5000);

    const pidIndex = _getAndValidatePidIndex(pid);
    // auto prevent double episode uploads
    _checkEpisodeUploadDuplication(pidIndex, name);

    const TxMetadata = await _validateDataTransaction(audio, "audio/");

    podcasts[pidIndex]["episodes"].push({
      eid: SmartWeave.transaction.id,
      childOf: pidIndex,
      episodeName: name,
      description: desc,
      audioTx: audio,
      audioTxByteSize: Number.parseInt(TxMetadata.size),
      type: TxMetadata.type,
      uploader: caller,
      uploadedAt: SmartWeave.block.timestamp,
      uploadedAtBlockheight: SmartWeave.block.height, // V3 metadata
      logs: [SmartWeave.transaction.id],
    });

    return { state };
  }

  // PODCAST ACTIONS:
  // PERMISSIONED TO THE CONTRACT
  // OWNER (DEPLOYER) ONLY

  if (input.function === "updatePodcastMetadata") {
    const pid = input.pid;
    const name = input.name;
    const desc = input.desc;
    const cover = input.cover;
    const author = input.author;
    const email = input.email;
    const lang = input.lang;
    const categories = input.categories;
    const isExplicit = input.isExplicit;

    await _isSuperAdmin(true, caller);

    const pidIndex = _getAndValidatePidIndex(pid);
    const actionTx = SmartWeave.transaction.id;

    if (name) {
      _validateStringTypeLen(name, 2, 500);
      podcasts[pidIndex]["podcastName"] = name;
    }

    if (desc) {
      _validateStringTypeLen(desc, 10, 7500);
      podcasts[pidIndex]["description"] = desc;
    }

    if (author) {
      _validateStringTypeLen(author, 2, 150);
      podcasts[pidIndex]["author"] = author;
    }

    if (email) {
      _validateStringTypeLen(email, 0, 320);
      podcasts[pidIndex]["email"] = email;
    }

    if (lang) {
      _validateStringTypeLen(lang, 2, 2);
      podcasts[pidIndex]["language"] = lang;
    }

    if (categories) {
      _validateStringTypeLen(categories, 1, 300);
      podcasts[pidIndex]["categories"] = categories
        .split(",")
        .map((category) => category.trim());
    }

    if (isExplicit) {
      if (!["yes", "no"].includes(isExplicit)) {
        throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
      }

      podcasts[pidIndex]["explicit"] = isExplicit;
    }

    if (cover) {
      await _validateDataTransaction(cover, "image/");
      podcasts[pidIndex]["cover"] = cover;
    }

    podcasts[pidIndex]["logs"].push(actionTx);

    return { state };
  }

  if (input.function === "addMaintainer") {
    const address = input.address;

    await _getContractOwner(true, caller);
    _validateStringTypeLen(address, 43, 43);

    if (maintainers.includes(address)) {
      throw new ContractError(ERROR_MAINTAINER_ALREADY_ADDED);
    }

    maintainers.push(address);
    return { state };
  }

  if (input.function === "removeMaintainer") {
    const address = input.address;

    await _getContractOwner(true, caller);
    _validateStringTypeLen(address, 43, 43);

    if (!maintainers.includes(address)) {
      throw new ContractError(ERROR_MAINTAINER_NOT_FOUND);
    }

    maintainers.splice(
      maintainers.findIndex((m) => m === address),
      1
    );

    return { state };
  }

  if (input.function === "addSuperAdmin") {
    const address = input.address;

    await _getContractOwner(true, caller);
    _validateStringTypeLen(address, 43, 43);

    if (superAdmins.includes(address)) {
      throw new ContractError(ERROR_SUPER_ADMIN_ALREADY_ADDED);
    }

    superAdmins.push(address);

    return { state };
  }

  if (input.function === "removeSuperAdmin") {
    const address = input.address;

    _validateStringTypeLen(address, 43, 43);

    if (caller !== address && caller != SmartWeave.contract.owner) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

    if (!superAdmins.includes(address)) {
      throw new ContractError(ERROR_SUPER_ADMIN_NOT_EXIST);
    }

    superAdmins.splice(
      superAdmins.findIndex((m) => m === address),
      1
    );

    return { state };
  }

  if (input.function === "importState") {
    // for migration from V2 to V3
    // migration is valid for a single attempt
    const factoryID = input.factoryID;

    await _isSuperAdmin(true, caller);
    _validateStringTypeLen(factoryID, 43, 43);

    const factoryTxObject = await SmartWeave.unsafeClient.transactions.get(
      factoryID
    );
    const owner = await SmartWeave.unsafeClient.wallets.ownerToAddress(
      factoryTxObject.owner
    );
    const tags = factoryTxObject.get("tags");
    const tagsMap = new Map();

    for (let tag of tags) {
      const key = tag.get("name", { decode: true, string: true });
      const value = tag.get("value", { decode: true, string: true });
      tagsMap.set(key, value);
    }

    // validate if the factory deployer is a superAdmin/contractOwner
    await _isSuperAdmin(true, owner);

    if (
      !tagsMap.has("Contract-Src") ||
      tagsMap.get("Contract-Src") !== v2SourceCode
    ) {
      throw new ContractError(ERROR_V2_SRC_NOT_VALID);
    }

    if (state.hasMigrated) {
      throw new ContractError(ERROR_MIGRATION_DONE);
    }

    if (podcasts.length > 0) {
      throw new ContractError(ERROR_CANNOT_MIGRATE_TO_ACTIVE_FACTORY);
    }

    const v2State = (await SmartWeave.contracts.readContractState(factoryID))
      ?.podcasts;

    if (v2State === undefined) {
      throw new ContractError(ERROR_STATE_CANNOT_MIGRATE);
    }

    state.podcasts = v2State;
    state.hasMigrated = true;

    return { state };
  }

  // EPISODES ACTIONS:
  // PERMISSIONED TO THE CONTRACT
  // OWNER AND MAINTAINERS

  if (input.function === "updateEpisodeMetadata") {
    const eid = input.eid;
    const name = input.name;
    const desc = input.desc;

    await _getMaintainers(true, caller);

    const pid = _getPidOfEid(eid);
    const pidIndex = _getAndValidatePidIndex(pid);
    const eidIndex = _getAndValidateEidIndex(eid);
    const actionTx = SmartWeave.transaction.id;

    if (name) {
      _validateStringTypeLen(name, 2, 500);
      podcasts[pidIndex]["episodes"][eidIndex]["episodeName"] = name;
    }

    if (desc) {
      _validateStringTypeLen(desc, 0, 5000);
      podcasts[pidIndex]["episodes"][eidIndex]["description"] = desc;
    }

    podcasts[pidIndex]["episodes"][eidIndex]["logs"].push(actionTx);

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

    if (str.trim().length < minLen || str.trim().length > maxLen) {
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
    const contractOwner = SmartWeave.contract.owner;
    if (validate && contractOwner !== caller) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }
  }

  async function _getMaintainers(validate, address) {
    const superAdmins = await _isSuperAdmin(false);
    const contractMaintainers = superAdmins.concat(maintainers);

    if (validate && !contractMaintainers.includes(address)) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

    return contractMaintainers;
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

  function _getAndValidatePidIndex(pid) {
    const index = podcasts.findIndex((podcast) => podcast["pid"] === pid);

    if (index >= 0) {
      return index;
    }

    throw new ContractError(ERROR_PID_NOT_FOUND);
  }

  function _getAndValidateEidIndex(eid, pidIndex) {
    const index = podcasts[pidIndex].episodes.find(
      (episode) => episode["eid"] === eid
    );

    if (index >= 0) {
      return index;
    }

    throw new ContractError(ERROR_EID_NOT_FOUND);
  }

  function _getPidOfEid(eid) {
    const pid = podcasts.find((podcast) =>
      podcast.episodes.find((episode) => episode["eid"] === eid)
    )?.["pid"];

    if (!pid) {
      throw new ContractError(ERROR_PID_OF_EID_NOT_FOUND);
    }

    return pid;
  }

  async function _isSuperAdmin(validate, address) {
    const contractOwner = SmartWeave.contract.owner;
    const allAdmins = superAdmins.concat(contractOwner);

    if (validate && !allAdmins.includes(address)) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

    return allAdmins;
  }

  function _checkPodcastUploadDuplication(name) {
    const duplicationIndex = podcasts.findIndex(
      (podcast) => podcast["podcastName"] === name
    );
    if (duplicationIndex === -1) {
      return false;
    }

    const duplicationBlockheight =
      podcasts[duplicationIndex]?.createdAtBlockheight;
    // backward compatibility with V2 migrations
    if (!duplicationBlockheight) {
      return false;
    }

    if (duplicationBlockheight + 5 > SmartWeave.block.height) {
      throw new ContractError(ERROR_PODCAST_UPLOAD_DUPLICATED);
    }

    return false;
  }

  function _checkEpisodeUploadDuplication(pidIndex, name) {
    const duplicationIndex = podcasts[pidIndex].episodes.findIndex(
      (episode) => episode["episodeName"] === name
    );
    if (duplicationIndex === -1) {
      return false;
    }

    const duplicationBlockheight =
      podcasts[pidIndex]["episodes"][duplicationIndex]?.uploadedAtBlockheight;
    // backward compatibility with V2 migrations
    if (!duplicationBlockheight) {
      return false;
    }

    if (duplicationBlockheight + 5 > SmartWeave.block.height) {
      throw new ContractError(ERROR_EPISODE_UPLOAD_DUPLICATED);
    }

    return false;
  }

  throw new ContractError("unknow function supplied: ", input.function);
}
