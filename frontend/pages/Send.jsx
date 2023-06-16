import { route } from 'https://esm.sh/preact-router'
import { useEffect } from 'https://esm.sh/preact/hooks'

//this is just a stupid way to redirect out of /frontend/html/index.html for now lol
const Send = () => {
    useEffect(() => route('/'), [])
}

export default Send