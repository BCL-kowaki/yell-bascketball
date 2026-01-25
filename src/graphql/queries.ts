/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getPost = /* GraphQL */ `
  query GetPost($id: ID!) {
    getPost(id: $id) {
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
export const listPosts = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
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
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        postId
        authorEmail
        content
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLike = /* GraphQL */ `
  query GetLike($id: ID!) {
    getLike(id: $id) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listLikes = /* GraphQL */ `
  query ListLikes(
    $filter: ModelLikeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLikes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        postId
        userEmail
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getRegion = /* GraphQL */ `
  query GetRegion($id: ID!) {
    getRegion(id: $id) {
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
export const listRegions = /* GraphQL */ `
  query ListRegions(
    $filter: ModelRegionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRegions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPrefecture = /* GraphQL */ `
  query GetPrefecture($id: ID!) {
    getPrefecture(id: $id) {
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
export const listPrefectures = /* GraphQL */ `
  query ListPrefectures(
    $filter: ModelPrefectureFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPrefectures(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        regionId
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDistrict = /* GraphQL */ `
  query GetDistrict($id: ID!) {
    getDistrict(id: $id) {
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
export const listDistricts = /* GraphQL */ `
  query ListDistricts(
    $filter: ModelDistrictFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDistricts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        prefectureId
        name
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const likesByPostAndUser = /* GraphQL */ `
  query LikesByPostAndUser(
    $postId: ID!
    $userEmail: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelLikeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    likesByPostAndUser(
      postId: $postId
      userEmail: $userEmail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        postId
        userEmail
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const regionBySlug = /* GraphQL */ `
  query RegionBySlug(
    $slug: String!
    $sortDirection: ModelSortDirection
    $filter: ModelRegionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    regionBySlug(
      slug: $slug
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const prefecturesByRegionIdAndSortOrder = /* GraphQL */ `
  query PrefecturesByRegionIdAndSortOrder(
    $regionId: ID!
    $sortOrder: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPrefectureFilterInput
    $limit: Int
    $nextToken: String
  ) {
    prefecturesByRegionIdAndSortOrder(
      regionId: $regionId
      sortOrder: $sortOrder
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        regionId
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const prefectureBySlug = /* GraphQL */ `
  query PrefectureBySlug(
    $slug: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPrefectureFilterInput
    $limit: Int
    $nextToken: String
  ) {
    prefectureBySlug(
      slug: $slug
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        regionId
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const districtsByPrefectureIdAndSortOrder = /* GraphQL */ `
  query DistrictsByPrefectureIdAndSortOrder(
    $prefectureId: ID!
    $sortOrder: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelDistrictFilterInput
    $limit: Int
    $nextToken: String
  ) {
    districtsByPrefectureIdAndSortOrder(
      prefectureId: $prefectureId
      sortOrder: $sortOrder
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        prefectureId
        name
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
