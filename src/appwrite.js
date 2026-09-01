import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject(PROJECT_ID); 

const database = new Databases(client);
console.log(PROJECT_ID)

export const updateSearchCount = async (searchTerm, movie) => {
    //Use appwrite SDK to check if the search term already exists in the database
    // If it does, update the count
    // If it doesn't, create a new document with the search term and count of 1
    try {
        if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) return;

        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if(result.documents.length > 0) {
            const doc = result.documents[0];
            // const currentCount = result.documents[0].count || 0;
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
                // lastSearch: movie,
            });
        }
        else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error(error);
    }
    
}