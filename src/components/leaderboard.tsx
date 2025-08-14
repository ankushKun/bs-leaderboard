import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExternalLink, Trophy, Medal, Award, Search, X, Sparkles } from "lucide-react"

type ScoreItem = {
    username: string
    url: string
    buckets: string // comma separated list of buckets
    points: number // calculated points for this entry
    address: string
}

type LeaderboardEntry = {
    username: string
    address: string
    totalPoints: number
    entries: ScoreItem[]
}

interface LeaderboardProps {
    scores: ScoreItem[]
    activeAddress?: string
    userRank?: number
    userTotalPoints?: number
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-100 drop-shadow-lg" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-100 drop-shadow-lg" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-100 drop-shadow-lg" />
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

export default function Leaderboard({ scores, activeAddress, userRank, userTotalPoints }: LeaderboardProps) {
    const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Group scores by address and sum up points
    const leaderboardData: LeaderboardEntry[] = scores.reduce((acc, score) => {
        const existingEntry = acc.find(entry => entry.address === score.address)

        if (existingEntry) {
            existingEntry.totalPoints += score.points
            existingEntry.entries.push(score)
        } else {
            acc.push({
                username: score.username,
                address: score.address,
                totalPoints: score.points,
                entries: [score]
            })
        }

        return acc
    }, [] as LeaderboardEntry[])

    // Sort by total points in descending order
    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints)

    // Filter data based on search query
    const filteredData = leaderboardData.filter((entry) => {
        if (!searchQuery.trim()) return true

        const query = searchQuery.toLowerCase().trim()

        // Search in both username and address
        return entry.username.toLowerCase().includes(query) ||
            entry.address.toLowerCase().includes(query)
    })

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="w-full p-0 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-sm">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 p-6 border-b border-border/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-glow">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold gradient-text-animate">
                                Leaderboard
                            </h2>
                            <p className="text-sm text-muted-foreground">Top performers in the competition</p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by username or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-200"
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
                        <div className="mt-2 text-sm text-muted-foreground">
                            Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </div>
                    )}

                    {/* User Rank Display */}
                    {activeAddress && userRank && userTotalPoints && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getRankColor(userRank)} ${getRankGlow(userRank)}`}>
                                        {getRankIcon(userRank) || userRank}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-purple-700 dark:text-purple-300">Your Ranking</div>
                                        <div className="text-sm text-muted-foreground">
                                            Rank #{userRank} of {leaderboardData.length} participants
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {userTotalPoints} pts
                                    </div>
                                    <div className="text-xs text-muted-foreground">Total Score</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <CardContent className="p-0">
                    <div className="space-y-3 p-6">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                {searchQuery ? (
                                    <div className="space-y-3">
                                        <div className="text-xl font-medium">No results found</div>
                                        <div className="text-sm opacity-75">Try adjusting your search terms</div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchQuery("")}
                                            className="mt-3 hover:bg-purple-500/10 hover:border-purple-500/50 transition-colors"
                                        >
                                            Clear Search
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-xl font-medium">No entries found</div>
                                )}
                            </div>
                        ) : (
                            filteredData.map((entry, index) => {
                                const rank = index + 1
                                const isCurrentUser = entry.address === activeAddress

                                return (
                                    <Dialog key={entry.address}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={`w-full h-auto p-6 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300 group ${isCurrentUser ? 'ring-2 ring-purple-500/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'hover:scale-[1.02]'}`}
                                                onClick={() => setSelectedEntry(entry)}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${getRankColor(rank)} ${getRankGlow(rank)} group-hover:scale-110 transition-transform duration-200`}>
                                                            {getRankIcon(rank) || rank}
                                                        </div>
                                                        <div className="flex flex-col items-start">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-lg group-hover:text-purple-600 transition-colors">
                                                                    {entry.username}
                                                                </span>
                                                                <Badge variant="outline" className="text-xs font-mono bg-muted/50 border-border/50">
                                                                    #{rank}
                                                                </Badge>
                                                                {isCurrentUser && (
                                                                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                                                        You
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-muted-foreground font-mono">
                                                                {truncateAddress(entry.address)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="text-lg font-bold bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                                                            {entry.totalPoints} pts
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs bg-muted/50">
                                                            {entry.entries.length} entries
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-background to-muted border-border">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${getRankColor(rank)}`}>
                                                        {getRankIcon(rank) || rank}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">{entry.username}</div>
                                                        <div className="text-sm text-muted-foreground">{entry.totalPoints} points</div>
                                                    </div>
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                                                    <div className="font-semibold mb-3 text-purple-700 dark:text-purple-300">Player Info</div>
                                                    <div className="text-sm space-y-2">
                                                        <div><span className="font-medium">Username:</span> {entry.username}</div>
                                                        <div><span className="font-medium">Address:</span> <span className="font-mono bg-muted/50 px-2 py-1 rounded">{entry.address}</span></div>
                                                        <div><span className="font-medium">Total Points:</span> <span className="font-bold text-purple-600">{entry.totalPoints}</span></div>
                                                        <div><span className="font-medium">Total Entries:</span> {entry.entries.length}</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="font-semibold mb-3">Individual Entries</div>
                                                    <div className="space-y-3">
                                                        {entry.entries.map((score, scoreIndex) => (
                                                            <Card key={scoreIndex} className="p-4 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5 transition-colors border-border/50">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col flex-1">
                                                                        <div className="font-medium">Entry #{scoreIndex + 1}</div>
                                                                        <div className="text-sm text-muted-foreground mb-2">
                                                                            {score.url ? (
                                                                                <a
                                                                                    href={score.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors"
                                                                                >
                                                                                    View Link <ExternalLink className="w-3 h-3" />
                                                                                </a>
                                                                            ) : (
                                                                                "No URL provided"
                                                                            )}
                                                                        </div>
                                                                        {score.buckets && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {score.buckets.split(',').filter(bucket => bucket.trim()).map((bucket, bucketIndex) => (
                                                                                    <Badge key={bucketIndex} variant="secondary" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                                                                                        {bucket.trim()}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <Badge variant="outline" className="font-bold bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 ml-4">
                                                                        {score.points} pts
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
