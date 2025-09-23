"use client"
import Link from 'next/link';
import React from 'react'

const SearchFormReset = () => {

      const reset = () => {
        console.log('Resetting form...');
        const form = document.querySelector('.search-form') as HTMLFormElement;

        if (form) {
            form.reset();
        }
    }

  return (
    <button type="reset" onClick={reset} >
        <Link href='/' className="search-btn text-white" >
         <span>X</span>
        </Link>
    </button>
  )
}

export default SearchFormReset