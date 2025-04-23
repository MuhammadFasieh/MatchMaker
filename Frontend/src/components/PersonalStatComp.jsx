import React from 'react'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'
import Step6 from './Step6'
import Step7 from './Step7'
import Step8 from './Step8'
import Step9 from './Step9'

const PersonalStatComp = () => {
  return (
    <div className='flex items-center justify-center flex-col gap-10 h-fit overflow-hidden mx-[2rem]'>
      <h1 className='text-[36px] font-semibold text-center pt-20 text-[#104962]'>Personal Statement</h1>
      <p className='w-full text-[16px] text-[#104962] text-center'>Let's build your Personal Statement together.</p>
      <Step1/>
      <Step2/>
      <Step3/>
      <Step4/>
      <Step5/>
      <Step6/>
      <Step7/>
      <Step8/>
      <Step9/>
    </div>
  )
}

export default PersonalStatComp
