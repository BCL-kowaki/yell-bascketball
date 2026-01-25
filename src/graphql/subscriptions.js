/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
    onCreateUser(filter: $filter) {
      id
      firstName
      lastName
      email
      bio
      location
      avatar
      coverImage
      category
      regionBlock
      prefecture
      district
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
    onUpdateUser(filter: $filter) {
      id
      firstName
      lastName
      email
      bio
      location
      avatar
      coverImage
      category
      regionBlock
      prefecture
      district
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
    onDeleteUser(filter: $filter) {
      id
      firstName
      lastName
      email
      bio
      location
      avatar
      coverImage
      category
      regionBlock
      prefecture
      district
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost($filter: ModelSubscriptionPostFilterInput) {
    onCreatePost(filter: $filter) {
      id
      content
      imageUrl
      pdfUrl
      pdfName
      locationName
      locationAddress
      linkUrl
      linkTitle
      linkDescription
      linkImage
      likesCount
      commentsCount
      authorEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost($filter: ModelSubscriptionPostFilterInput) {
    onUpdatePost(filter: $filter) {
      id
      content
      imageUrl
      pdfUrl
      pdfName
      locationName
      locationAddress
      linkUrl
      linkTitle
      linkDescription
      linkImage
      likesCount
      commentsCount
      authorEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost($filter: ModelSubscriptionPostFilterInput) {
    onDeletePost(filter: $filter) {
      id
      content
      imageUrl
      pdfUrl
      pdfName
      locationName
      locationAddress
      linkUrl
      linkTitle
      linkDescription
      linkImage
      likesCount
      commentsCount
      authorEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment($filter: ModelSubscriptionCommentFilterInput) {
    onCreateComment(filter: $filter) {
      id
      postId
      authorEmail
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment($filter: ModelSubscriptionCommentFilterInput) {
    onUpdateComment(filter: $filter) {
      id
      postId
      authorEmail
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment($filter: ModelSubscriptionCommentFilterInput) {
    onDeleteComment(filter: $filter) {
      id
      postId
      authorEmail
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateLike = /* GraphQL */ `
  subscription OnCreateLike($filter: ModelSubscriptionLikeFilterInput) {
    onCreateLike(filter: $filter) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateLike = /* GraphQL */ `
  subscription OnUpdateLike($filter: ModelSubscriptionLikeFilterInput) {
    onUpdateLike(filter: $filter) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteLike = /* GraphQL */ `
  subscription OnDeleteLike($filter: ModelSubscriptionLikeFilterInput) {
    onDeleteLike(filter: $filter) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateRegion = /* GraphQL */ `
  subscription OnCreateRegion($filter: ModelSubscriptionRegionFilterInput) {
    onCreateRegion(filter: $filter) {
      id
      name
      slug
      sortOrder
      prefectures {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateRegion = /* GraphQL */ `
  subscription OnUpdateRegion($filter: ModelSubscriptionRegionFilterInput) {
    onUpdateRegion(filter: $filter) {
      id
      name
      slug
      sortOrder
      prefectures {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteRegion = /* GraphQL */ `
  subscription OnDeleteRegion($filter: ModelSubscriptionRegionFilterInput) {
    onDeleteRegion(filter: $filter) {
      id
      name
      slug
      sortOrder
      prefectures {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreatePrefecture = /* GraphQL */ `
  subscription OnCreatePrefecture(
    $filter: ModelSubscriptionPrefectureFilterInput
  ) {
    onCreatePrefecture(filter: $filter) {
      id
      regionId
      region {
        id
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      name
      slug
      sortOrder
      districts {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdatePrefecture = /* GraphQL */ `
  subscription OnUpdatePrefecture(
    $filter: ModelSubscriptionPrefectureFilterInput
  ) {
    onUpdatePrefecture(filter: $filter) {
      id
      regionId
      region {
        id
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      name
      slug
      sortOrder
      districts {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeletePrefecture = /* GraphQL */ `
  subscription OnDeletePrefecture(
    $filter: ModelSubscriptionPrefectureFilterInput
  ) {
    onDeletePrefecture(filter: $filter) {
      id
      regionId
      region {
        id
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      name
      slug
      sortOrder
      districts {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateDistrict = /* GraphQL */ `
  subscription OnCreateDistrict($filter: ModelSubscriptionDistrictFilterInput) {
    onCreateDistrict(filter: $filter) {
      id
      prefectureId
      prefecture {
        id
        regionId
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      name
      sortOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateDistrict = /* GraphQL */ `
  subscription OnUpdateDistrict($filter: ModelSubscriptionDistrictFilterInput) {
    onUpdateDistrict(filter: $filter) {
      id
      prefectureId
      prefecture {
        id
        regionId
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      name
      sortOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteDistrict = /* GraphQL */ `
  subscription OnDeleteDistrict($filter: ModelSubscriptionDistrictFilterInput) {
    onDeleteDistrict(filter: $filter) {
      id
      prefectureId
      prefecture {
        id
        regionId
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      name
      sortOrder
      createdAt
      updatedAt
      __typename
    }
  }
`;
