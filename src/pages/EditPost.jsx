import React,{useEffect,useState} from 'react'
import {Container,PostForm} from '../components/index'
import appwriteService from '../appwrite/config'

import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

function EditPost() {
    const [post, setPost] = useState([])
    const {slug}= useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if(slug){
            appwriteService.getPost(slug).then((res) => {
                if(res){
                    setPost(res)
                }
            })
        }
        else{
            navigate('/')
        }
    },[slug,navigate])


  return post?(
    <div
    className='py-8'>
        <Container>
            <PostForm post={post}/>
        </Container>
    </div>
  ):null
}

export default EditPost
