'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Check, X, Trash2 } from 'lucide-react'

export default function DocumentUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDuplicateFile = (file: File) => {
    return files.some(existingFile => 
      existingFile.name === file.name && 
      existingFile.size === file.size &&
      existingFile.type === file.type
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      const newFiles = selectedFiles.filter(file => !isDuplicateFile(file));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      if (newFiles.length < selectedFiles.length) {
        console.log('Some files were not added because they were already in the list.');
        // You could also add a user-facing notification here
      }
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setUploadComplete(false)

    // Simulate file upload process
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Simulate API call
    try {
      // In a real scenario, you would send the files to your server here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
      
      // Simulating successful upload
      setUploadComplete(true)
      console.log('Files uploaded successfully')
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const removeAllFiles = () => {
    setFiles([])
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mb-6 border rounded-lg p-6 bg-gray-50">
      <h2 className="text-2xl font-serif mb-4">Upload Document</h2>
      <div className="flex items-center space-x-2 mb-4">
        <Input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileChange} 
          accept=".pdf" 
          multiple
          className="bg-white"
        />
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || uploading}
          className="min-w-[100px]"
        >
          {uploading ? (
            <div className="flex items-center">
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress}%
            </div>
          ) : uploadComplete ? (
            <div className="flex items-center text-green-500">
              <Check className="mr-2 h-4 w-4" />
              Done
            </div>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </>
          )}
        </Button>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Uploaded Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-white p-2 rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">{files.length} file(s) selected</span>
            <Button
              variant="outline"
              size="sm"
              onClick={removeAllFiles}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

