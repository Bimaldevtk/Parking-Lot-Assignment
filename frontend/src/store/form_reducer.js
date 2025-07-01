export const initialState = {
  startDate: "",
  endDate: "",
  selectedSlotId: "",
  availableSlots: [],
};

export function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_AVAILABLE_SLOTS":
      return { ...state, availableSlots: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
