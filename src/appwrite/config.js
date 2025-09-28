// src/appwrite/config.js
import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;
  storage;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.databases = new Databases(this.client);
    this.storage   = new Storage(this.client);
  }

  async createPost({ title, slug, content, featuredimage, status, userid }) {
    const documentId = slug || ID.unique();
    return this.databases.createDocument(
      conf.appwriteDatabaseId,
      conf.appwriteCollectionId,
      documentId,
      { title, content, featuredimage, status, userid }
    );
  }

  async updatePost(slug, { title, content, featuredimage, status }) {
    return this.databases.updateDocument(
      conf.appwriteDatabaseId,
      conf.appwriteCollectionId,
      slug,
      { title, content, featuredimage, status }
    );
  }

  async deletePost(slug) {
    await this.databases.deleteDocument(
      conf.appwriteDatabaseId,
      conf.appwriteCollectionId,
      slug
    );
    return true;
  }

  async getPost(slug) {
    return this.databases.getDocument(
      conf.appwriteDatabaseId,
      conf.appwriteCollectionId,
      slug
    );
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    return this.databases.listDocuments(
      conf.appwriteDatabaseId,
      conf.appwriteCollectionId,
      queries
    );
  }

  // ---------- FILE STORAGE ----------
  async uploadFile(file) {
    const uploadedFile = await this.storage.createFile(
      conf.appwriteBucketId,
      ID.unique(),
      file
    );
    // return both id and URL string
    const fileUrl = this.storage.getFileView(
      conf.appwriteBucketId,
      uploadedFile.$id
    );
    return { $id: uploadedFile.$id, url: fileUrl };
  }

  async deleteFile(fileId) {
    await this.storage.deleteFile(conf.appwriteBucketId, fileId);
    return true;
  }

  async getFileView(fileId) {
    if (!fileId) return null;
    // ✅ This already returns a direct URL string
    return this.storage.getFileView(conf.appwriteBucketId, fileId);
  }
}

const service = new Service();
export default service;
