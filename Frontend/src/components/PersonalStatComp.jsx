import React from 'react'
import PersonalStatementWorkflow from './PersonalStatementWorkflow'

const PersonalStatComp = () => {
  return (
    <div className='flex items-center justify-center flex-col gap-10 h-fit overflow-hidden mx-[2rem]'>
      <h1 className='text-[36px] font-semibold text-center pt-20 text-[#104962]'>Personal Statement</h1>
      <p className='w-full text-[16px] text-[#104962] text-center'>Let's build your Personal Statement together.</p>
      <PersonalStatementWorkflow />
    </div>
  )
}

export default PersonalStatComp
