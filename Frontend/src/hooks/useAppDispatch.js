import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/index.js";

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch = () => useDispatch();
