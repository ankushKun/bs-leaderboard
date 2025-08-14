import { ConnectButton } from "@arweave-wallet-kit/react";
import { ThemeToggleButton } from "./theme-toggle";
import { Trophy } from "lucide-react";

export default function Navbar() {
    return (
        <header className="border-b border-border/50 w-full bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-200 group-hover:scale-105 animate-glow">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold gradient-text-animate">
                            BS Scoreboard
                        </h1>
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggleButton />
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}