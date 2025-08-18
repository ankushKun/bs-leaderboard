import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExternalLink, Trophy, Medal, Award, Search, X, Sparkles, Twitter } from "lucide-react"

type ScoreItem = {
    username: string
    twitterUsername?: string // Twitter username (optional)
    url: string
    buckets: string // comma separated list of buckets
    points: number // calculated points for this entry
    address: string
}

type LeaderboardEntry = {
    username: string
    twitterUsername?: string
    address: string
    totalPoints: number
    entries: ScoreItem[]
    globalRank?: number
}

interface LeaderboardProps {
    scores: ScoreItem[]
    activeAddress?: string
    userRank?: number
    userTotalPoints?: number
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-100 drop-shadow-lg" />
    if (rank === 2) return <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-100 drop-shadow-lg" />
    if (rank === 3) return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 drop-shadow-lg" />
    return null
}

const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/25"
    if (rank === 2) return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 shadow-lg shadow-gray-500/25"
    if (rank === 3) return "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-700 shadow-lg shadow-amber-500/25"
    return "bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600 shadow-lg shadow-purple-500/25"
}

const getRankGlow = (rank: number) => {
    if (rank === 1) return "animate-pulse shadow-yellow-500/50"
    if (rank === 2) return "shadow-gray-500/30"
    if (rank === 3) return "shadow-amber-500/30"
    return "shadow-purple-500/20"
}

// Helper function to extract Twitter username from various formats
const extractTwitterUsername = (username: string, twitterUsername?: string): string | null => {
    if (twitterUsername) {
        return twitterUsername.startsWith('@') ? twitterUsername : `@${twitterUsername}`
    }

    // Try to extract from username if it looks like a Twitter handle
    if (username.startsWith('@')) {
        return username
    }

    // Check if username contains twitter.com or x.com
    if (username.includes('twitter.com/') || username.includes('x.com/')) {
        const match = username.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/)
        return match ? `@${match[1]}` : null
    }

    return null
}

export default function Leaderboard({ scores, activeAddress, userRank, userTotalPoints }: LeaderboardProps) {
    const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Group scores by username (Twitter username if available, otherwise regular username)
    const leaderboardData: LeaderboardEntry[] = scores.reduce((acc, score) => {
        const twitterUsername = extractTwitterUsername(score.username, score.twitterUsername)
        const groupKey = twitterUsername || score.username

        const existingEntry = acc.find(entry => {
            const entryTwitterUsername = extractTwitterUsername(entry.username, entry.twitterUsername)
            const entryGroupKey = entryTwitterUsername || entry.username
            return entryGroupKey === groupKey
        })

        if (existingEntry) {
            existingEntry.totalPoints += score.points
            existingEntry.entries.push(score)
        } else {
            acc.push({
                username: score.username,
                twitterUsername: twitterUsername || undefined,
                address: score.address,
                totalPoints: score.points,
                entries: [score]
            })
        }

        return acc
    }, [] as LeaderboardEntry[])

    // Sort by total points in descending order and assign global ranks
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints)

    // Add global rank to each entry
    leaderboardData.forEach((entry, index) => {
        entry.globalRank = index + 1
    })

    // Filter data based on search query
    const filteredData = leaderboardData.filter((entry) => {
        if (!searchQuery.trim()) return true

        const query = searchQuery.toLowerCase().trim()
        const twitterUsername = extractTwitterUsername(entry.username, entry.twitterUsername)

        // Search in username, Twitter username, and address (if available)
        return entry.username.toLowerCase().includes(query) ||
            (twitterUsername && twitterUsername.toLowerCase().includes(query)) ||
            (entry.address && entry.address.toLowerCase().includes(query))
    })

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const getDisplayName = (entry: LeaderboardEntry) => {
        const twitterUsername = extractTwitterUsername(entry.username, entry.twitterUsername)
        return twitterUsername || entry.username
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="w-full p-0 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm">
                {/* Header with gradient */}
                <div className="bg-[#f59b30]/15 p-4 sm:p-6 border-b border-border/50">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center animate-glow">
                            <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-responsive-xl sm:text-2xl font-bold text-[#1DA1F2]">
                                Twitter Leaderboard
                            </h2>
                            <p className="text-responsive-sm text-muted-foreground">Top performers by Twitter handle</p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Twitter handle, username, or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background/50 border-border/50 focus:border-[#1DA1F2]/50 focus:ring-[#1DA1F2]/20 transition-all duration-200 text-responsive-sm"
                            />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    {searchQuery && (
                        <div className="mt-2 text-responsive-sm text-muted-foreground">
                            Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </div>
                    )}

                    {/* User Rank Display */}
                    {activeAddress && userRank && userTotalPoints && (
                        <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-[#1DA1F2]/10 to-[#1DA1F2]/20 rounded-xl border border-[#1DA1F2]/20">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-responsive-base sm:text-lg ${getRankColor(userRank)} ${getRankGlow(userRank)}`}>
                                        {getRankIcon(userRank) || userRank}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-responsive-sm sm:text-base text-[#1DA1F2]">Your Ranking</div>
                                        <div className="text-responsive-xs sm:text-sm text-muted-foreground">
                                            Rank #{userRank} of {leaderboardData.length} participants
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <div className="font-bold text-responsive-lg sm:text-xl bg-gradient-to-r from-[#1DA1F2] to-[#1DA1F2]/80 bg-clip-text text-transparent">
                                        {userTotalPoints} XP
                                    </div>
                                    <div className="text-responsive-xs text-muted-foreground">Total Score</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <CardContent className="p-0">
                    <div className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-8 sm:py-12 text-muted-foreground">
                                {searchQuery ? (
                                    <div className="space-y-3">
                                        <div className="text-responsive-lg sm:text-xl font-medium">No results found</div>
                                        <div className="text-responsive-sm opacity-75">Try adjusting your search terms</div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchQuery("")}
                                            className="mt-3 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/50 transition-colors"
                                        >
                                            Clear Search
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-responsive-lg sm:text-xl font-medium">No entries found</div>
                                )}
                            </div>
                        ) : (
                            filteredData.map((entry, index) => {
                                const rank = entry.globalRank || index + 1
                                const isCurrentUser = entry.address && entry.address === activeAddress
                                const displayName = getDisplayName(entry)
                                const hasTwitterHandle = extractTwitterUsername(entry.username, entry.twitterUsername)

                                return (
                                    <Dialog key={entry.username + (entry.address || '')}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={`w-full h-auto p-3 sm:p-6 hover:bg-gradient-to-r hover:from-[#1DA1F2]/10 hover:to-[#1DA1F2]/20 transition-all duration-300 group ${isCurrentUser ? 'ring-2 ring-[#1DA1F2]/50 bg-gradient-to-r from-[#1DA1F2]/10 to-[#1DA1F2]/20' : 'hover:scale-[1.02]'}`}
                                                onClick={() => setSelectedEntry(entry)}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3 sm:gap-0">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-responsive-base sm:text-lg ${getRankColor(rank)} ${getRankGlow(rank)} group-hover:scale-110 transition-transform duration-200`}>
                                                            {getRankIcon(rank) || rank}
                                                        </div>
                                                        <div className="flex flex-col items-start flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 w-full">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    {hasTwitterHandle && (
                                                                        <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2] flex-shrink-0" />
                                                                    )}
                                                                    <span className="font-bold text-responsive-base sm:text-lg group-hover:text-[#1DA1F2] transition-colors truncate">
                                                                        {displayName}
                                                                    </span>
                                                                </div>
                                                                <Badge variant="outline" className="text-responsive-xs font-mono bg-muted/50 border-border/50 flex-shrink-0">
                                                                    #{rank}
                                                                </Badge>
                                                                {isCurrentUser && (
                                                                    <Badge variant="secondary" className="text-responsive-xs bg-gradient-to-r from-[#1DA1F2] to-[#1DA1F2]/80 text-white border-0 flex-shrink-0">
                                                                        You
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {entry.address && (
                                                                <span className="text-responsive-sm text-muted-foreground font-mono truncate w-full">
                                                                    {truncateAddress(entry.address)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                        <Badge variant="outline" className="text-responsive-base sm:text-lg font-bold bg-gradient-to-r from-[#1DA1F2]/10 to-[#1DA1F2]/20 border-[#1DA1F2]/30 text-[#1DA1F2]">
                                                            {entry.totalPoints} XP
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-responsive-xs bg-muted/50">
                                                            {entry.entries.length} entries
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-background to-muted border-border mx-4 sm:mx-0">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold ${getRankColor(rank)}`}>
                                                        {getRankIcon(rank) || rank}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            {hasTwitterHandle && (
                                                                <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2]" />
                                                            )}
                                                            <div className="font-bold text-responsive-lg sm:text-lg">{displayName}</div>
                                                        </div>
                                                        <div className="text-responsive-sm text-muted-foreground">{entry.totalPoints} XP</div>
                                                    </div>
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                <div className="p-3 sm:p-4 bg-gradient-to-r from-[#1DA1F2]/10 to-[#1DA1F2]/20 rounded-xl border border-[#1DA1F2]/20">
                                                    <div className="font-semibold mb-3 text-responsive-base sm:text-base text-[#1DA1F2]">Player Info</div>
                                                    <div className="text-responsive-sm space-y-2">
                                                        <div><span className="font-medium">Display Name:</span> {displayName}</div>
                                                        {hasTwitterHandle && (
                                                            <div><span className="font-medium">Twitter:</span> <span className="font-mono bg-[#1DA1F2]/10 px-2 py-1 rounded text-responsive-xs">{displayName}</span></div>
                                                        )}
                                                        {entry.address && (
                                                            <div><span className="font-medium">Address:</span> <span className="font-mono bg-muted/50 px-2 py-1 rounded text-responsive-xs break-all">{entry.address}</span></div>
                                                        )}
                                                        <div><span className="font-medium">Total XP:</span> <span className="font-bold text-[#1DA1F2]">{entry.totalPoints}</span></div>
                                                        <div><span className="font-medium">Total Entries:</span> {entry.entries.length}</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="font-semibold mb-3 text-responsive-base sm:text-base">Individual Entries</div>
                                                    <div className="space-y-3">
                                                        {entry.entries.map((score, scoreIndex) => (
                                                            <Card key={scoreIndex} className="p-3 sm:p-4 hover:bg-gradient-to-r hover:from-[#1DA1F2]/5 hover:to-[#1DA1F2]/10 transition-colors border-border/50">
                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                                    <div className="flex flex-col flex-1">
                                                                        <div className="font-medium text-responsive-base">Entry #{scoreIndex + 1}</div>
                                                                        <div className="text-responsive-sm text-muted-foreground mb-2">
                                                                            {score.url ? (
                                                                                <a
                                                                                    href={score.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-1 text-[#1DA1F2] hover:text-[#1DA1F2]/80 transition-colors break-all"
                                                                                >
                                                                                    View Link <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                                                </a>
                                                                            ) : (
                                                                                "No URL provided"
                                                                            )}
                                                                        </div>
                                                                        {score.buckets && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {score.buckets.split(',').filter(bucket => bucket.trim()).map((bucket, bucketIndex) => (
                                                                                    <Badge key={bucketIndex} variant="secondary" className="text-responsive-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                                                                                        {bucket.trim()}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Badge variant="outline" className="font-bold bg-gradient-to-r from-[#1DA1F2]/10 to-[#1DA1F2]/20 border-[#1DA1F2]/30 sm:ml-4 w-fit">
                                                                        {score.points} XP
                                                                    </Badge>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
