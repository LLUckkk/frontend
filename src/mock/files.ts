export const mockFiles = {
  files: [
    {
      id: 1,
      username: "主席1",
      tag: "Biology",
      upload_time: "2024-03-15 10:30:00",
      file_url: "/images/biology1.jpg",
      ai_checked: true,
      manually_checked: true,
      result: true
    },
    {
      id: 2,
      username: "主席2",
      tag: "Medicine",
      upload_time: "2024-03-14 15:45:00",
      file_url: "/images/medicine1.jpg",
      ai_checked: true,
      manually_checked: false,
      result: null
    },
    {
      id: 3,
      username: "主席1",
      tag: "Chemistry",
      upload_time: "2024-03-13 09:20:00",
      file_url: "/images/chemistry1.jpg",
      ai_checked: true,
      manually_checked: true,
      result: false
    },
    {
      id: 4,
      username: "主席1",
      tag: "Graphics",
      upload_time: "2024-03-12 14:15:00",
      file_url: "/images/graphics1.jpg",
      ai_checked: false,
      manually_checked: false,
      result: null
    },
    {
      id: 5,
      username: "主席2",
      tag: "Other",
      upload_time: "2024-03-11 11:30:00",
      file_url: "/images/other1.jpg",
      ai_checked: true,
      manually_checked: true,
      result: true
    }
  ],
  current_page: 1,
  total_pages: 1,
  total_files: 5
}

export const mockFileImages = {
  imgs: [
    {
      img_id: 1,
      img_url: "/images/biology1.jpg",
      isDetect: "true",
      isReview: "true",
      isFake: "true"
    },
    {
      img_id: 2,
      img_url: "/images/biology2.jpg",
      isDetect: "true",
      isReview: "false",
      isFake: null
    },
    {
      img_id: 3,
      img_url: "/images/biology3.jpg",
      isDetect: "false",
      isReview: "false",
      isFake: null
    },
    {
      img_id: 4,
      img_url: "/images/biology4.jpg",
      isDetect: "true",
      isReview: "true",
      isFake: "false"
    }
  ],
  has_next: false
} 