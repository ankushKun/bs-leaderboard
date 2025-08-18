import stars from "@/assets/stars.png";
import squares from "@/assets/squares.png";
import text from "@/assets/text.png";

interface HeroProps {
    xUsername?: string;
    userPoints?: number;
    userRank?: number;
    isConnected?: boolean;
    activeAddress?: string;
}

export default function Hero({ xUsername, userPoints, userRank, isConnected, activeAddress }: HeroProps) {
    return (
        <div className="relative block mx-auto w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] my-3 sm:my-4 lg:my-5 px-4 sm:px-6 lg:px-8">
            <img
                src={text}
                alt="BUILDstation LEADERBOARD"
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto h-full max-w-full object-contain"
            />
            {/* <img src={squares} alt="squares" className="absolute top-56 left-0 w-full animate-bounce" style={{ animationDuration: '10s', animationTimingFunction: 'ease-in-out' }} /> */}
            <img
                src={stars}
                alt="stars"
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto h-full max-w-full object-contain animate-bounce"
                style={{ animationDuration: '10s', animationTimingFunction: 'ease-in-out', animationDelay: '2s' }}
            />

            {/* User info overlay when connected */}
            {isConnected && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-md border border-orange-500/20 rounded-xl px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">gm</span>
                        {xUsername ? (
                            <span className="font-semibold text-orange-600">@{xUsername}</span>
                        ) : (
                            <span className="font-semibold text-orange-600 font-mono text-xs whitespace-nowrap">
                                {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-6)}
                            </span>
                        )}
                        {userPoints !== undefined && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-semibold text-green-600 whitespace-nowrap">{userPoints} XP</span>
                            </>
                        )}
                        {userRank && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-semibold text-blue-600 whitespace-nowrap">Rank #{userRank}</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}