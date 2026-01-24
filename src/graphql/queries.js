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
      avatar
      coverImage
      category
      region
      prefecture
      district
      teams
      isEmailPublic
      isRegistrationDatePublic
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
        avatar
        coverImage
        category
        region
        prefecture
        district
        teams
        isEmailPublic
        isRegistrationDatePublic
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
      tournamentId
      teamId
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
        tournamentId
        teamId
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
      name
      slug
      sortOrder
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
export const getTeam = /* GraphQL */ `
  query GetTeam($id: ID!) {
    getTeam(id: $id) {
      id
      name
      category
      region
      prefecture
      district
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTeams = /* GraphQL */ `
  query ListTeams(
    $filter: ModelTeamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTeams(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        region
        prefecture
        district
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTournament = /* GraphQL */ `
  query GetTournament($id: ID!) {
    getTournament(id: $id) {
      id
      name
      iconUrl
      coverImage
      category
      regionBlock
      prefecture
      district
      description
      ownerEmail
      coAdminEmails
      startDate
      endDate
      favoritesCount
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTournaments = /* GraphQL */ `
  query ListTournaments(
    $filter: ModelTournamentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTournaments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        iconUrl
        coverImage
        category
        regionBlock
        prefecture
        district
        description
        ownerEmail
        coAdminEmails
        startDate
        endDate
        favoritesCount
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getFollow = /* GraphQL */ `
  query GetFollow($id: ID!) {
    getFollow(id: $id) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listFollows = /* GraphQL */ `
  query ListFollows(
    $filter: ModelFollowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFollows(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        followerEmail
        followingEmail
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getFavorite = /* GraphQL */ `
  query GetFavorite($id: ID!) {
    getFavorite(id: $id) {
      id
      userEmail
      tournamentId
      teamId
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listFavorites = /* GraphQL */ `
  query ListFavorites(
    $filter: ModelFavoriteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFavorites(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userEmail
        tournamentId
        teamId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTournamentTeam = /* GraphQL */ `
  query GetTournamentTeam($id: ID!) {
    getTournamentTeam(id: $id) {
      id
      tournamentId
      teamId
      teamName
      participationYear
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTournamentTeams = /* GraphQL */ `
  query ListTournamentTeams(
    $filter: ModelTournamentTeamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTournamentTeams(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        tournamentId
        teamId
        teamName
        participationYear
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTournamentResult = /* GraphQL */ `
  query GetTournamentResult($id: ID!) {
    getTournamentResult(id: $id) {
      id
      tournamentId
      year
      title
      content
      ranking
      createdBy
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTournamentResults = /* GraphQL */ `
  query ListTournamentResults(
    $filter: ModelTournamentResultFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTournamentResults(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        tournamentId
        year
        title
        content
        ranking
        createdBy
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const postsByTournament = /* GraphQL */ `
  query PostsByTournament(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByTournament(
      tournamentId: $tournamentId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        tournamentId
        teamId
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
export const followsByFollower = /* GraphQL */ `
  query FollowsByFollower(
    $followerEmail: String!
    $sortDirection: ModelSortDirection
    $filter: ModelFollowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    followsByFollower(
      followerEmail: $followerEmail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        followerEmail
        followingEmail
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const followsByFollowing = /* GraphQL */ `
  query FollowsByFollowing(
    $followingEmail: String!
    $sortDirection: ModelSortDirection
    $filter: ModelFollowFilterInput
    $limit: Int
    $nextToken: String
  ) {
    followsByFollowing(
      followingEmail: $followingEmail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        followerEmail
        followingEmail
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const favoritesByUser = /* GraphQL */ `
  query FavoritesByUser(
    $userEmail: String!
    $sortDirection: ModelSortDirection
    $filter: ModelFavoriteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    favoritesByUser(
      userEmail: $userEmail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userEmail
        tournamentId
        teamId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const teamsByTournament = /* GraphQL */ `
  query TeamsByTournament(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTournamentTeamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    teamsByTournament(
      tournamentId: $tournamentId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        tournamentId
        teamId
        teamName
        participationYear
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const resultsByTournament = /* GraphQL */ `
  query ResultsByTournament(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTournamentResultFilterInput
    $limit: Int
    $nextToken: String
  ) {
    resultsByTournament(
      tournamentId: $tournamentId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        tournamentId
        year
        title
        content
        ranking
        createdBy
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
