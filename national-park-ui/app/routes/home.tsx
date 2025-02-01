import type { Route } from "./+types/home";
import RunningSlider from "../welcome/RunningSlider";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function Home() {

  return (
    <div>
  <RunningSlider />
  </div>
);
}
