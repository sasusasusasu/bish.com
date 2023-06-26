import * as React from 'https://esm.sh/preact'
import PageButton from './PageButton.js'
import { useEffect } from 'https://esm.sh/preact/hooks'


const PageNumbers = ({quantity, perPage, setPage}) => {
    const pageCount = 1 + Math.ceil((quantity - perPage) / perPage)
    const buttons = []

    for (let i = 0; i < pageCount; i++) {
        buttons.push(<PageButton num={i + 1} setPage={setPage}/>)
    }

    useEffect(() => document.querySelector('.pagebuttons').firstChild.classList.add('active'), []) //stupid

    return (
        <div className='pagebuttons'>
            {buttons /*cool*/}
        </div>    
    )
}

export default PageNumbers