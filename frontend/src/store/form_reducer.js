export const initialState = {
  startDate: "",
  endDate: "",
  vehicleType: "",
  vehicleNumber: "",
  availableSlots: [],
  selectedSlotId: null,
  showResults: false,
};

export function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_AVAILABLE_SLOTS":
      return {
        ...state,
        availableSlots: action.payload,
        showResults: true,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
