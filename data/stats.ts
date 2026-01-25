export type Stat = {
    id: string;
    name: string;
    emoji: string;
    description: string;
};

let statsCache: Map<string, Stat> | null = null;

async function loadStats(): Promise<Map<string, Stat>> {
    if (statsCache) {
        return statsCache;
    }

    try {
        const indexResponse = await fetch('/characteristics/index.json');
        if (!indexResponse.ok) {
            throw new Error(`Failed to fetch characteristics index: ${indexResponse.statusText}`);
        }
        
        const indexData = await indexResponse.json();
        const filePaths = indexData.files || indexData; // Support both {files: []} and [] formats
        
        const stats = new Map<string, Stat>();
        
        for (const filePath of filePaths) {
            try {
                // Remove 'characteristics/' prefix if present
                const cleanPath = filePath.replace(/^characteristics\//, '');
                const response = await fetch(`/characteristics/${cleanPath}`);
                
                if (!response.ok) {
                    console.warn(`Failed to fetch characteristic ${filePath}: ${response.statusText}`);
                    continue;
                }
                
                const data: Stat = await response.json();
                stats.set(data.id, data);
            } catch (error) {
                console.warn(`Error loading characteristic ${filePath}:`, error);
            }
        }
        
        statsCache = stats;
        return stats;
    } catch (error) {
        console.error('Error loading characteristics:', error);
        return new Map();
    }
}

export async function getStatById(id: string): Promise<Stat | null> {
    const stats = await loadStats();
    return stats.get(id) || null;
}

export async function getAllStats(): Promise<Stat[]> {
    const stats = await loadStats();
    return Array.from(stats.values());
}
