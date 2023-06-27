import { getCurrentUrl } from "https://esm.sh/preact-router@4.1.1"
import * as React from 'https://esm.sh/preact'

const Search = () => {
    const searchQuery = getCurrentUrl().substring(8).replace(/%20/g, ' ') //convenient yes
    return (
        <div>
            <h2 className="asd">search results for {searchQuery}</h2>
            <p className="asd">(nothing)</p>
        </div>
    )
}

export default Search