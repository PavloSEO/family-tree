import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { HomePage } from "./HomePage.js";

/** Для viewer с `/` сразу в дерево (в сайдбаре только Дерево и Фотоальбомы). Копирайт на главной — в HomePage / layout. */
export function RootAuthLanding() {
  const { user } = useAuth();

  if (user?.role === "viewer") {
    return <Navigate to="/tree" replace />;
  }

  return <HomePage />;
}
