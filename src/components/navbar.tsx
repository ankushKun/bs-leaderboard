import { ConnectButton } from "@arweave-wallet-kit/react";
import { ThemeToggleButton } from "./theme-toggle";
import logo from "@/assets/logo.png";

export default function Navbar() {

    return (
        <header className="border-b border-border/50 w-full bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3 group">
                        <img src={logo} alt="Arweave India" className="h-8 w-auto dark:invert" />
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    {/* <ThemeToggleButton /> */}
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}