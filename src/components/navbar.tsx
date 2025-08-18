import { ConnectButton } from "@arweave-wallet-kit/react";
import { ThemeToggleButton } from "./theme-toggle";
import logo from "@/assets/logo.png";

interface NavbarProps {
    xUsername?: string;
    isConnected?: boolean;
    activeAddress?: string;
}

export default function Navbar({ xUsername, isConnected, activeAddress }: NavbarProps) {

    return (
        <header className="border-b border-border/50 w-full bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3 group">
                        <img src={logo} alt="Arweave India" className="h-8 w-auto dark:invert" />
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    {/* Show username when connected */}
                    {/* {isConnected && (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                            {xUsername ? (
                                <>
                                    <span className="text-sm text-muted-foreground">@</span>
                                    <span className="text-sm font-medium text-orange-600">{xUsername}</span>
                                </>
                            ) : (
                                <span className="text-sm font-medium text-orange-600 font-mono">
                                    {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-6)}
                                </span>
                            )}
                        </div>
                    )} */}
                    {/* <ThemeToggleButton /> */}
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}