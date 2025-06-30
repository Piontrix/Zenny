import { useSelector } from "react-redux";
import { RootState } from "../store/index.js";

// Use throughout your app instead of plain `useSelector`
export const useAppSelector = useSelector;
