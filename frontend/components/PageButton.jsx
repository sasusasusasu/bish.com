import * as React from 'https://esm.sh/preact'

const PageButton = ({num, setPage}) => {

    const handleClick = (e) => {
            if (document.querySelector('.active') !== e.target) {
                document.querySelector('.active').classList.remove('active')
                e.target.classList.add('active')
                setPage(num)
            }
        }

    return (
        <div className='pagebutton' onClick={e => handleClick(e)}>
            <p className='pagenumber'>
                {num}
            </p>
        </div>
    )
}

export default PageButton