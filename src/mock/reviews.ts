export const mockReviews = {
  requests: [
    {
      id: 1,
      username: "主席1",
      avatar: "/avatars/publisher1.jpg",
      state: "pending",
      file_type: "image",
      time: "2024-03-15 10:30:00"
    },
    {
      id: 2,
      username: "主席2",
      avatar: "/avatars/publisher2.jpg",
      state: "accepted",
      file_type: "image",
      time: "2024-03-14 15:45:00"
    },
    {
      id: 3,
      username: "主席1",
      avatar: "/avatars/publisher1.jpg",
      state: "refused",
      file_type: "image",
      time: "2024-03-13 09:20:00"
    },
    {
      id: 4,
      username: "主席2",
      avatar: "/avatars/publisher2.jpg",
      state: "pending",
      file_type: "image",
      time: "2024-03-12 14:15:00"
    },
    {
      id: 5,
      username: "主席1",
      avatar: "/avatars/publisher1.jpg",
      state: "accepted",
      file_type: "image",
      time: "2024-03-11 11:30:00"
    }
  ],
  current_page: 1,
  total_pages: 1,
  total_users: 5
}

export const mockReviewDetails = {
  imgs: [
    {
      id: 1,
      url: "/images/review1.jpg"
    },
    {
      id: 2,
      url: "/images/review2.jpg"
    }
  ],
  persons: [
    {
      id: 1,
      username: "编辑1",
      avatar: "/avatars/reviewer1.jpg"
    },
    {
      id: 2,
      username: "编辑2",
      avatar: "/avatars/reviewer2.jpg"
    }
  ],
  reason: "这是一组医学研究图片，需要专家审核确认其真实性。"
} 