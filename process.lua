sqlite3 = require("lsqlite3")
json = require("json")

db = db or sqlite3.open_memory()


db:exec [[
    CREATE TABLE IF NOT EXISTS points (
        username TEXT,
        url TEXT,
        buckets TEXT,
        points INTEGER,
        address TEXT
    )
]]

Buckets = {
    TWEET = 10,
    THREAD = 25,
    IMAGE = 15,
    VIDEO = 50,
    EDU = 25,
    BUILD = 15,
    COLLAB = 20,
    MEME = 15
}

-- @param username string
-- @param address string
-- @param link string
-- @param buckets table
function AddEntry(username, address, link, buckets)
    local bucket_string = ""
    local points_sum = 0
    for _, bucket in pairs(buckets) do
        -- print(bucket)
        if Buckets[bucket] then
            bucket_string = bucket_string .. bucket .. ","
            points_sum = points_sum + (Buckets[bucket] or 0)
        else
            error("Invalid bucket: " .. bucket)
        end
    end
    local stmt = db:prepare([[INSERT INTO points (username, url, buckets, points, address) VALUES (?, ?, ?, ?, ?)]])
    stmt:bind_values(username, link, bucket_string, tonumber(points_sum), address)
    local res = stmt:step()
    stmt:finalize()
    -- print(res)
    print("Added entry for " .. username .. " with " .. points_sum .. " points, " .. bucket_string)
end

AccessList = {
    ["8iD-Gy_sKx98oth27JhjjP2V_xUSIGqs_8-skb63YHg"] = true
}

Handlers.add("Add-Entry", function(msg)
    if not AccessList[msg.From] then
        error("Access denied")
        return
    end
    local username = msg.Data.username
    local address = msg.Data.address
    local link = msg.Data.link
    local buckets = json.decode(msg.Data.buckets)
    AddEntry(username, address, link, buckets)
end)

Handlers.add("Get-Points", function(msg)
    points = {}
    for row in db:nrows [[SELECT * FROM points]] do
        table.insert(points, row)
    end
    msg.reply({
        Data = json.encode(points)
    })
end)
