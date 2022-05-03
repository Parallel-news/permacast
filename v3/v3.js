/**
 * 
 * 
 * 
 * 
 * 
 *               ██████╗░███████╗██████╗░███╗░░░███╗░█████╗░░█████╗░░█████╗░░██████╗████████╗
 *               ██╔══██╗██╔════╝██╔══██╗████╗░████║██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
 *               ██████╔╝█████╗░░██████╔╝██╔████╔██║███████║██║░░╚═╝███████║╚█████╗░░░░██║░░░
 *               ██╔═══╝░██╔══╝░░██╔══██╗██║╚██╔╝██║██╔══██║██║░░██╗██╔══██║░╚═══██╗░░░██║░░░
 *               ██║░░░░░███████╗██║░░██║██║░╚═╝░██║██║░░██║╚█████╔╝██║░░██║██████╔╝░░░██║░░░
 *               ╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚═════╝░░░░╚═╝░░░
 *                                  
 *                     SWC as first level data registery for Arweave hosted podcasts.
 *
 * @version: TESTNET V3
 * @author charmful0x
 * website: permacast.net
 * License: MIT
 **/

export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;

  // STATE
  const podcasts = state.podcasts;
  const maintainers = state.maintainers;
  const superAdmins = state.superAdmins;
  const v2SourceCode = state.v2SourceCode;
  const limitations = state.limitations;

  // CONSTANTS
  // temporal oracle address for testing purposes
  const ORACLE_ADDRESS = "ocjLC0V7gZGfT-64jjPOpjtYCeX4xQrHGE10PRtUpHo";

  // LIMITATION METADATA ACCESS
  const POD_NAME_LIMITS = limitations["podcast_name_len"];
  const POD_DESC_LIMITS = limitations["podcast_desc_len"];
  const EP_NAME_LIMITS = limitations["episode_name_len"];
  const EP_DESC_LIMITS = limitations["episode_desc_len"];
  const AUTHOR_NAME_LIMITS = limitations["author_name_len"];
  const LANG_CHAR_LIMITS = limitations["lang_char_code"];
  const CATEGORY_LIMITS = limitations["categories"];

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
  const ERROR_OWNER_ALREADY_SWAPPED =
    "contract owner can be swapped one time only";
  const ERROR_INVALID_ARWEAVE_ADDRESS = "invalid Arweave address";

  if (input.function === "createPodcast") {
    /**
     * @dev create a podcast object and append it to
     * the smart contract state. Only the factory's
     * superAdmins have the permission to invoke it.
     *
     * @param name podcast name
     * @param author podcast author
     * @param lang language char code (ISO 639-1:2002)
     * @param isExplicit indicates the existence of
     * explicit content, used for RSS feed generating
     * @param categories RSS supported categories strings
     * @param email author email address
     * @param cover Arweave data TXID of type `image/*`
     *
     * @return state
     **/

    const name = input.name;
    const author = input.author;
    const lang = input.lang;
    const isExplicit = input.isExplicit;
    const categories = input.categories;
    const email = input.email;
    const cover = input.cover;

    await _isSuperAdmin(true, caller);

    const pid = SmartWeave.transaction.id;
    const desc = await _handleDescription(
      pid,
      POD_DESC_LIMITS.min,
      POD_DESC_LIMITS.max
    );

    _validateStringTypeLen(name, POD_NAME_LIMITS.min, POD_NAME_LIMITS.max);
    _validateStringTypeLen(
      author,
      AUTHOR_NAME_LIMITS.min,
      AUTHOR_NAME_LIMITS.max
    );
    _validateStringTypeLen(email, 0, 320);
    _validateStringTypeLen(
      categories,
      CATEGORY_LIMITS.min,
      CATEGORY_LIMITS.max
    );
    _validateStringTypeLen(cover, 43, 43);
    _validateStringTypeLen(lang, LANG_CHAR_LIMITS.min, LANG_CHAR_LIMITS.max);
    // auto-prevent double podcast creation
    _checkPodcastUploadDuplication(name);
    await _validateDataTransaction(cover, "image/");

    if (!["yes", "no"].includes(isExplicit)) {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    podcasts.push({
      pid: pid,
      createdAtBlockheight: SmartWeave.block.height, // blockheight - V3 metadata
      createdAt: SmartWeave.block.timestamp, // block's timestamp
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
      isVisible: true,
      episodes: [],
      logs: [pid],
    });

    return { state };
  }

  if (input.function === "addEpisode") {
    /**
     * @dev create an episode object and append
     *  it to a podcast object's episodes array
     *  Maintainers and SuperAdmins can invoke
     *  this function.
     *
     * @param pid podcast ID (pid). 43 chars string
     * @param name episode name
     * @param audio episode audio's Arweave TXID
     *
     * @return state
     **/

    const pid = input.pid;
    const name = input.name;
    const audio = input.audio;

    await _getMaintainers(true, caller);

    const eid = SmartWeave.transaction.id;

    // episode's description is extracted from the
    // interaction's TX body data.
    const desc = await _handleDescription(
      eid,
      EP_DESC_LIMITS.min,
      EP_DESC_LIMITS.max
    );

    _validateStringTypeLen(name, EP_NAME_LIMITS.min, EP_NAME_LIMITS.max);
    _validateStringTypeLen(audio, 43, 43);
    _validateStringTypeLen(pid, 43, 43);

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
      isVisible: true,
      logs: [SmartWeave.transaction.id],
    });

    return { state };
  }

  // PODCAST ACTIONS:
  // PERMISSIONED TO THE CONTRACT
  // OWNER (DEPLOYER) ONLY

  if (input.function === "updatePodcastMetadata") {
    /**
     * @dev update a podcast's object metadata that is
     * already created. Only superAdmins can invoke it.
     *
     * @param name podcast name
     * @param author podcast author
     * @param lang language char code (ISO 639-1:2002)
     * @param isExplicit indicates the existence of
     * explicit content, used for RSS feed generating
     * @param categories RSS supported categories strings
     * @param email author email address
     * @param cover Arweave data TXID of type `image/*`
     *
     * @return state
     **/

    const pid = input.pid;
    const name = input.name;
    const cover = input.cover;
    const author = input.author;
    const email = input.email;
    const lang = input.lang;
    const categories = input.categories;
    const isExplicit = input.isExplicit;

    // boolean - if true, get and validate
    // the interaction body TX data ( text/* )
    let desc = input.desc;

    await _isSuperAdmin(true, caller);

    const pidIndex = _getAndValidatePidIndex(pid);
    const actionTx = SmartWeave.transaction.id;

    if (name) {
      _validateStringTypeLen(name, POD_NAME_LIMITS.min, POD_NAME_LIMITS.max);
      podcasts[pidIndex]["podcastName"] = name;
    }

    if (desc) {
      desc = await _handleDescription(
        actionTx,
        POD_DESC_LIMITS.min,
        POD_DESC_LIMITS.max
      );
      podcasts[pidIndex]["description"] = desc;
    }

    if (author) {
      _validateStringTypeLen(
        author,
        AUTHOR_NAME_LIMITS.min,
        AUTHOR_NAME_LIMITS.max
      );
      podcasts[pidIndex]["author"] = author;
    }

    if (email) {
      _validateStringTypeLen(email, 0, 320);
      podcasts[pidIndex]["email"] = email;
    }

    if (lang) {
      _validateStringTypeLen(lang, LANG_CHAR_LIMITS.min, LANG_CHAR_LIMITS.max);
      podcasts[pidIndex]["language"] = lang;
    }

    if (categories) {
      _validateStringTypeLen(
        categories,
        CATEGORY_LIMITS.min,
        CATEGORY_LIMITS.max
      );
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

  // PERMISSION: CONTRACT OWNER (DEPLOYER)

  if (input.function === "addMaintainer") {
    /**
     * @dev add an address the the maintainers array.
     * Only the contract owner (deployer) has permission.
     *
     * @param address the new maintainer address
     *
     * @return state
     **/

    const address = input.address;

    await _getContractOwner(true, caller);
    _validateAddress(address);

    if (maintainers.includes(address)) {
      throw new ContractError(ERROR_MAINTAINER_ALREADY_ADDED);
    }

    maintainers.push(address);
    return { state };
  }

  if (input.function === "removeMaintainer") {
    /**
     * @dev remove a maintainer from the the maintainers array.
     * Only the contract owner (deployer) has permission.
     *
     * @param address the address of to-remove maintainer
     *
     * @return state
     **/

    const address = input.address;

    _validateAddress(address);

    // a maintainer can remove himself or get removed by the sc owner
    if (address !== caller && caller !== SmartWeave.contract.owner) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

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
    /**
     * @dev add an address the the superAdmins array.
     * Only the contract owner (deployer) has permission.
     *
     * @param address the new superAdmin address
     *
     * @return state
     **/

    const address = input.address;

    await _getContractOwner(true, caller);
    _validateAddress(address);

    if (superAdmins.includes(address)) {
      throw new ContractError(ERROR_SUPER_ADMIN_ALREADY_ADDED);
    }

    superAdmins.push(address);

    return { state };
  }

  if (input.function === "removeSuperAdmin") {
    /**
     * @dev remove a superAdmin from the the superAdmins array.
     * Only the contract owner (deployer) has permission.
     *
     * @param address the address of to-remove maintainer
     *
     * @return state
     **/

    const address = input.address;

    _validateAddress(address);

    // a superAdmin can remove himself or get removed by the sc owner
    if (caller !== address && caller !== SmartWeave.contract.owner) {
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
    /**
     * @dev migrate state from V2 factory to
     * a new non-used V3 deployed factory.
     *
     * Only a superAdmin can invoke this function.
     *
     * This function can be invoked only once. After
     * that, the migration possibility will be sealed.
     *
     * @param factoryID the contract ID of the V2 factory
     *
     * @return overwritten state
     **/

    const factoryID = input.factoryID;

    await _isSuperAdmin(true, caller);
    _validateAddress(factoryID);

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

  if (input.function === "reverseVisibility") {
    /**
     * @dev reverse the visibility of a podcast/episode.
     * it just reverse a boolean value of the `isVisibile`
     * property. The podcast/episode cannot be removed
     * from the factory state.
     *
     * Only superAdmins can invoke this function.
     *
     * @param type is the object type, "eid" or "pid"
     * @param id PID of type "pid" or EID of type "eid"
     *
     * @return state
     *
     **/

    const type = input.type;
    const id = input.id;

    await _isSuperAdmin(true, caller);

    if (type === "pid") {
      const pidIndex = _getAndValidatePidIndex(id);
      const currentVisibility = podcasts[pidIndex].isVisible;
      podcasts[pidIndex].isVisible = !currentVisibility;

      return { state };
    }

    if (type === "eid") {
      const pid = _getPidOfEid(id);
      const pidIndex = _getAndValidatePidIndex(pid);
      const eidIndex = _getAndValidateEidIndex(id);

      const currentVisibility =
        podcasts[pidIndex]["episodes"][eidIndex].isVisible;
      podcasts[pidIndex]["episodes"][eidIndex].isVisible = !currentVisibility;

      return { state };
    }

    throw new ContractError(ERROR_INVALID_CALLER);
  }

  // EPISODES ACTIONS:
  // PERMISSIONED TO THE CONTRACT
  // OWNER AND MAINTAINERS

  if (input.function === "updateEpisodeMetadata") {
    /**
     * @dev update the episode's metadata.
     *  Maintainers and SuperAdmins can invoke
     *  this function.
     *
     * @param eid episode ID (eid). 43 chars string
     * @param name episode name
     * @param audio episode audio's Arweave TXID
     * @param desc is a boolean that's when set to true,
     * the episode's description is extracted from the
     * interaction TXID body data.
     *
     * @return state
     *
     **/

    const eid = input.eid;
    const name = input.name;
    let desc = input.desc;

    await _getMaintainers(true, caller);

    const pid = _getPidOfEid(eid);
    const pidIndex = _getAndValidatePidIndex(pid);
    const eidIndex = _getAndValidateEidIndex(eid);
    const actionTx = SmartWeave.transaction.id;

    if (name) {
      _validateStringTypeLen(name, EP_NAME_LIMITS.min, EP_NAME_LIMITS.max);
      podcasts[pidIndex]["episodes"][eidIndex]["episodeName"] = name;
    }

    if (desc) {
      desc = await _handleDescription(
        actionTx,
        EP_DESC_LIMITS.min,
        EP_DESC_LIMITS.max
      );
      podcasts[pidIndex]["episodes"][eidIndex]["description"] = desc;
    }

    podcasts[pidIndex]["episodes"][eidIndex]["logs"].push(actionTx);

    return { state };
  }

  if (input.function === "swapOwner") {
    /**
     * @dev this function is invoked one time only after V2 <> V3 migration
     * the purpose of this function is to deploy & migrate V2 on behalf
     * of the V2 factory owner, then give him/her back full ownership.
     *
     * @param address the address of the new contract owner.
     *
     * @return state
     **/

    const address = input.address;

    _validateAddress(address);
    await _getContractOwner(true, caller);

    // contract owner can be swapped for once only
    if (!state.ownerSwapped) {
      SmartWeave.contract.owner = address;
      state.ownerSwapped = true;
      return { state };
    }

    throw new ContractError(ERROR_OWNER_ALREADY_SWAPPED);
  }

  if (input.function === "fetchOracle") {
    /**
     * @dev read the oracle's state and update the limitations
     * object of the factory (contract's state).
     *
     * @return state
     *
     **/

    await _getContractOwner(true, caller);

    const oracleState = await SmartWeave.contracts.readContractState(
      ORACLE_ADDRESS
    );

    // update the limitations according to the oracle;
    state.limitations = oracleState.limitations;

    return { state };
  }

  // HELPER FUNCTIONS:
  function _getPodcastIndex() {
    if (podcasts.length === 0) {
      return 0;
    }

    return podcasts.length;
  }

  function _validateAddress(address) {
    _validateStringTypeLen(address, 43, 43);

    if (!/[a-z0-9_-]{43}/i.test(address)) {
      throw new ContractError(ERROR_INVALID_ARWEAVE_ADDRESS);
    }
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
    // remove any address duplication amongst different privileges
    const filteredMaintainers = Array.from(new Set(contractMaintainers));

    if (validate && !filteredMaintainers.includes(address)) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

    return filteredMaintainers;
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

    // remove any address duplication amongst different privileges
    const filteredSupers = Array.from(new Set(allAdmins));

    if (validate && !filteredSupers.includes(address)) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }

    return filteredSupers;
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

  async function _handleDescription(txid, min, max) {
    if (/[a-z0-9_-]{43}/i.test(txid)) {
      const tagsMap = new Map();
      const txObject = await SmartWeave.unsafeClient.transactions.get(txid);

      const tags = txObject.get("tags");

      for (let tag of tags) {
        const key = tag.get("name", { decode: true, string: true });
        const value = tag.get("value", { decode: true, string: true });
        tagsMap.set(key, value);
      }

      if (!tagsMap.has("Content-Type")) {
        throw new ContractError(ERROR_NOT_A_DATA_TX);
      }

      if (!tagsMap.get("Content-Type").startsWith("text/")) {
        throw new ContractError(ERROR_MIME_TYPE);
      }

      const data = await SmartWeave.unsafeClient.transactions.getData(txid, {
        decode: true,
        string: true,
      });

      _validateStringTypeLen(data, min, max);
      return data;
    }

    throw new ContractError(ERROR_INVALID_STRING_LENGTH);
  }

  throw new ContractError("unknow function supplied: ", input.function);
}
