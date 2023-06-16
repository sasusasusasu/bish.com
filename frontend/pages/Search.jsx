import { getCurrentUrl } from "https://esm.sh/preact-router"
import * as React from 'https://esm.sh/preact'

const Search = () => {
    const searchQuery = getCurrentUrl().substring(8).replace(/%20/g, ' ') //convenient yes
    return (
        <div>
            <h2>search results for {searchQuery}</h2>
            <p>(nothing)</p>
        </div>
    )
}

export default Search