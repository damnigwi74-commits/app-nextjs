"use client"
import { Link } from 'lucide-react';
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
        <Link href='/' className="size-[50px] rounded-full bg-black flex justify-center items-center text-white" >
        X
        </Link>
    </button>
  )
}

export default SearchFormReset