export async function handle(state, action) {
  const caller = action.caller;
  const input = action.input;

  const balances = state.balances;

  const ERROR_INVALID_PRIMITIVE_TYPE =
    "the parameter has been seeded by a wrong data type";
  const ERROR_INVALID_TRANSFER_AMOUNT =
    "this aNFT does not support fractional ownership";
  const ERROR_UNSUFFICIENT_BALANCE = "the caller does not have balance";
  const ERROR_INVALID_TARGET = "the input cannot be used as target";

  if (input.function === "transfer") {
    const target = input.target;
    const qty = input.qty;

    _validateQty(qty);
    _validateTarget(target, caller);
    _validateTransfer(qty, caller);

    balances[caller] -= qty;

    if (!balances[target]) {
      balances[target] = 0;
    }

    balances[target] += qty;
    state.owner = target;

    return { state };
  }

  if (input.function === "balance") {
    if (!input.address) {
      input.address = caller;
    }

    if (typeof address !== "string" || address.length !== 43) {
      throw new ContractError(ERROR_INVALID_TARGET);
    }

    const amount = address in balances ? balances[address] : 0;

    return {
      result: {
        balance: amount,
      },
    };
  }

  function _validateQty(qty) {
    if (!Number.isInteger(qty)) {
      throw new ContractError(ERROR_INVALID_PRIMITIVE_TYPE);
    }

    if (qty === 0) {
      throw new ContractError(ERROR_INVALID_TRANSFER_AMOUNT);
    }

  }

  function _validateTarget(target, caller) {
    if (typeof target !== "string" || target.length !== 43) {
      throw new ContractError(ERROR_INVALID_TARGET);
    }

    if (target === caller) {
      throw new ContractError(ERROR_INVALID_TARGET);
    }
  }

  function _validateTransfer(qty, address) {
    if (!balances[address]) {
      throw new ContractError(ERROR_UNSUFFICIENT_BALANCE);
    }

    if (qty !== balances[address]) {
      throw new ContractError(ERROR_INVALID_TRANSFER_AMOUNT);
    }
  }
}

