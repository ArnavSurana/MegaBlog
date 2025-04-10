import conf from '../conf/conf.js';
import { Client, ID ,Databases,Storage,Query} from 'appwrite';

export class Service{
    client= new Client();
    databases;
    bucket;

    constructor(){
        this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
        this.databases= new Databases(this.client);
        this.bucket= new Storage(this.client);
    }

    async createPost({title,slug,content,featuredImage,status,userId}){
        try{
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                    userid: userId, 
                     // Changed to match database schema
                }
            )
        }
        catch (error) {
            console.log("Appwrite service :: createPost :: error", error);
        }
    }

    async updatePost(slug, {title, content, featuredImage, status}) {
        try {
            if (!slug) {
                throw new Error("Missing required parameter: documentId");
            }
            
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status
                }
            );
        }
        catch(e) {
            console.error("Appwrite service :: updatePost :: error", e);
            throw e;
        }
    }

    async deletePost(slug){
        try{
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            )
            return true;
        }
        catch(e){
            console.log(e);
            return false;

        }
        
    }

    async getPost(slug){
        try{
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            )
        }
        catch(e){
            throw e;
        }
    }

    async getPosts(queries=[Query.equal("status","active")]){
        try{
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            )
        }
        catch(e){
            throw e;
        }
    }

    async uploadFile(file){
        try{
            const reponse= await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            )
            console.log("Appwrite service :: uploadFile :: response",reponse);
            return reponse;
        }
        catch(e){
            console.log("Appwrite service :: uploadFile :: error",e);
            return false;
        }
    }

    async deleteFile(fileId) {
        if (!fileId) {
            console.warn("Appwrite service :: deleteFile :: Skipped: No fileId provided");
            return false;
        }
    
        try {
            await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
            return true;
        } catch (error) {
            console.error("Appwrite service :: deleteFile :: error", error);
            return false;
        }
    }

    getFilePreview(fileId) {
        return this.bucket.getFileView(conf.appwriteBucketId, fileId);
      }
}

const service=new Service()
export default service;