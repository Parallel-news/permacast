export async function handle(state, action) {

  const caller = action.caller;
  const input = action.input;
  
  // STATE VARIABLES
  const admins = state.admins;
  const limitations = state.limitations;

  // ERRORS LIST
  const ERROR_INVALID_CALLER =
    "non-permissioned address has invoked the function";
  const NON_INTEGER_NUMBER_PASSED = "only integer numbers are allowed";
  const ERROR_MISSING_ARGUMENTS =
    "at least one limitations argument is required to invoke this function";
  const ERROR_MIN_GREATER_THAN_MAX =
    "min limitation cannot be greater than max limitation";

  if (input.function === "updateLimitations") {
  	/**
  	 * @dev update the oracle's limitations (contract state).
  	 * Only the contract admins can invoke this function.
  	 * 
  	 * @param podcast_name_len podcast's name lengh limits as [min, max] array
  	 * @param podcast_desc_len podcast's description lengh limits as [min, max] array
  	 * @param author_name_len author's name lengh limits as [min, max] array
  	 * @param lang_char_code depends on the ISO used. also [min, max] array.
  	 * @param categories categories words length. should be compatible with RSS
  	 * feeds generating web2 audio platforms (Spotify, iTunes). also [min, max]
  	 * @param episode_name_len episode's name lengh limits as [min, max] array
  	 * @param nepisode_desc_len episode's description lengh limits as [min, max] array
  	 * 
  	 **/
  	 
    _isAdmin(caller);

    if (Object.keys(input).length < 2) {
      throw new ContractError(ERROR_MISSING_ARGUMENTS);
    }

    for (let inputName of Object.keys(input)) {
      if (inputName in limitations) {
      	// min/max are expected to be passed in an array of values
        const min = _validateInteger(input[inputName][0]);
        const max = _validateInteger(input[inputName][1]);

        // prevent human errors
        if (min > max) {
          throw new ContractError(ERROR_MIN_GREATER_THAN_MAX);
        }

        limitations[inputName].min = min;
        limitations[inputName].max = max;
      }
    }

    return { state };
  }

  // HELPER FNCTIONS
  function _isAdmin(address) {
    if (!admins.includes(address)) {
      throw new ContractError(ERROR_INVALID_CALLER);
    }
  }

  function _validateInteger(nb) {
    if (typeof number !== "number" && !Number.isInteger(nb)) {
      throw new ContractError(NON_INTEGER_NUMBER_PASSED);
    }

    return nb;
  }
}
