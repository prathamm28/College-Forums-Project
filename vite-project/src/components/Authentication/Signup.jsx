import { FormControl, FormLabel, Input, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'

const Signup = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();


  return (
    <VStack spacing='5px' color="black">
      <FormControl id='first-name' isRequired>
        <FormLabel>Name</FormLabel>
        <Input
        placeholder='Enter Your Name'
        onChange={(e)=>setName(e.target.value)} 
        />
      </FormControl>
    </VStack>
  )
}

export default Signup
