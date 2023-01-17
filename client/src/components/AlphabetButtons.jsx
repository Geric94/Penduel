import React, {useState} from 'react';

//import styles from '../styles';

const AlphabetButtons = ({handleClick}) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    return (    
        <div>
            {alphabet.split('').map(letter => (
                <button className='px-1 py-1 rounded-lg bg-siteViolet w-fit text-white font-rajdhani font-bold mt-1 ml-1 mr-1 mb-1'
                    key={letter}
                    name={letter}
                    onClick={handleClick}>
                    {letter}
                </button>
            ))}
        </div>
    )
};

export default AlphabetButtons;
