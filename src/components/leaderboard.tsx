import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExternalLink, Trophy, Medal, Award, Search, X } from "lucide-react"

type ScoreItem = {
    username: string
    url: string
    points: number
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
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-100" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-100" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-100" />
    return null
}

const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600"
    if (rank === 2) return "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500"
    if (rank === 3) return "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700"
    return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700"
}

export default function Leaderboard({ scores, activeAddress }: LeaderboardProps) {
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
            <Card className="w-full p-0">

                {/* Search Section */}
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by username or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="h-8 w-8 p-0"
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
                </div>
                <CardContent className="p-0">

                    <div className="space-y-2 p-4">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchQuery ? (
                                    <div className="space-y-2">
                                        <div className="text-lg font-medium">No results found</div>
                                        <div className="text-sm">Try adjusting your search terms</div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchQuery("")}
                                            className="mt-2"
                                        >
                                            Clear Search
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-lg font-medium">No entries found</div>
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
                                                className={`w-full h-auto p-4 hover:bg-accent/50 transition-all duration-200 ${isCurrentUser ? 'ring-2 ring-primary/50 bg-primary/10' : ''
                                                    }`}
                                                onClick={() => setSelectedEntry(entry)}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRankColor(rank)}`}>
                                                            {getRankIcon(rank) || rank}
                                                        </div>
                                                        <div className="flex flex-col items-start">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-lg">{entry.username}</span>
                                                                {isCurrentUser && (
                                                                    <Badge variant="secondary" className="text-xs">You</Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-muted-foreground font-mono">
                                                                {truncateAddress(entry.address)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-lg font-bold">
                                                            {entry.totalPoints} pts
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {entry.entries.length} entries
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getRankColor(rank)}`}>
                                                        {getRankIcon(rank) || rank}
                                                    </div>
                                                    {entry.username} - {entry.totalPoints} points
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <div className="font-semibold mb-2">Player Info</div>
                                                    <div className="text-sm space-y-1">
                                                        <div><span className="font-medium">Username:</span> {entry.username}</div>
                                                        <div><span className="font-medium">Address:</span> <span className="font-mono">{entry.address}</span></div>
                                                        <div><span className="font-medium">Total Points:</span> {entry.totalPoints}</div>
                                                        <div><span className="font-medium">Total Entries:</span> {entry.entries.length}</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="font-semibold mb-3">Individual Entries</div>
                                                    <div className="space-y-2">
                                                        {entry.entries.map((score, scoreIndex) => (
                                                            <Card key={scoreIndex} className="p-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col">
                                                                        <div className="font-medium">Entry #{scoreIndex + 1}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {score.url ? (
                                                                                <a
                                                                                    href={score.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                                                >
                                                                                    View Link <ExternalLink className="w-3 h-3" />
                                                                                </a>
                                                                            ) : (
                                                                                "No URL provided"
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="font-bold">
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
