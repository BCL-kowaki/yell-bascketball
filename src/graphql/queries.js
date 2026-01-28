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
      region
      regionBlock
      prefecture
      district
      teams
      isEmailPublic
      isRegistrationDatePublic
      instagramUrl
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
        region
        regionBlock
        prefecture
        district
        teams
        isEmailPublic
        isRegistrationDatePublic
        instagramUrl
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
      instagramUrl
      createdAt
      updatedAt
      teams {
        nextToken
        __typename
      }
      results {
        nextToken
        __typename
      }
      invitations {
        nextToken
        __typename
      }
      posts {
        nextToken
        __typename
      }
      favorites {
        nextToken
        __typename
      }
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
        instagramUrl
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
      shortName
      logoUrl
      coverImageUrl
      founded
      region
      prefecture
      headcount
      category
      description
      website
      instagramUrl
      ownerEmail
      editorEmails
      isApproved
      createdAt
      updatedAt
      tournamentTeams {
        nextToken
        __typename
      }
      posts {
        nextToken
        __typename
      }
      favorites {
        nextToken
        __typename
      }
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
        shortName
        logoUrl
        coverImageUrl
        founded
        region
        prefecture
        headcount
        category
        description
        website
        instagramUrl
        ownerEmail
        editorEmails
        isApproved
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
      videoUrl
      videoName
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
      comments {
        nextToken
        __typename
      }
      tournament {
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
        instagramUrl
        createdAt
        updatedAt
        __typename
      }
      team {
        id
        name
        shortName
        logoUrl
        coverImageUrl
        founded
        region
        prefecture
        headcount
        category
        description
        website
        instagramUrl
        ownerEmail
        editorEmails
        isApproved
        createdAt
        updatedAt
        __typename
      }
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
        videoUrl
        videoName
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
      post {
        id
        content
        imageUrl
        videoUrl
        videoName
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
export const getFavorite = /* GraphQL */ `
  query GetFavorite($id: ID!) {
    getFavorite(id: $id) {
      id
      userEmail
      tournamentId
      teamId
      createdAt
      updatedAt
      tournament {
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
        instagramUrl
        createdAt
        updatedAt
        __typename
      }
      team {
        id
        name
        shortName
        logoUrl
        coverImageUrl
        founded
        region
        prefecture
        headcount
        category
        description
        website
        instagramUrl
        ownerEmail
        editorEmails
        isApproved
        createdAt
        updatedAt
        __typename
      }
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
      tournament {
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
        instagramUrl
        createdAt
        updatedAt
        __typename
      }
      team {
        id
        name
        shortName
        logoUrl
        coverImageUrl
        founded
        region
        prefecture
        headcount
        category
        description
        website
        instagramUrl
        ownerEmail
        editorEmails
        isApproved
        createdAt
        updatedAt
        __typename
      }
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
      startDate
      endDate
      imageUrl
      pdfUrl
      pdfName
      createdBy
      createdAt
      updatedAt
      tournament {
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
        instagramUrl
        createdAt
        updatedAt
        __typename
      }
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
        startDate
        endDate
        imageUrl
        pdfUrl
        pdfName
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
export const getTournamentInvitation = /* GraphQL */ `
  query GetTournamentInvitation($id: ID!) {
    getTournamentInvitation(id: $id) {
      id
      tournamentId
      tournamentName
      inviterEmail
      inviteeEmail
      status
      createdAt
      updatedAt
      tournament {
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
        instagramUrl
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const listTournamentInvitations = /* GraphQL */ `
  query ListTournamentInvitations(
    $filter: ModelTournamentInvitationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTournamentInvitations(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        tournamentId
        tournamentName
        inviterEmail
        inviteeEmail
        status
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
      prefectures {
        nextToken
        __typename
      }
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
      name
      slug
      regionId
      sortOrder
      createdAt
      updatedAt
      region {
        id
        name
        slug
        sortOrder
        createdAt
        updatedAt
        __typename
      }
      districts {
        nextToken
        __typename
      }
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
        name
        slug
        regionId
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
      name
      prefectureId
      sortOrder
      createdAt
      updatedAt
      prefecture {
        id
        name
        slug
        regionId
        sortOrder
        createdAt
        updatedAt
        __typename
      }
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
        name
        prefectureId
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
export const postsByTournamentId = /* GraphQL */ `
  query PostsByTournamentId(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByTournamentId(
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
        videoUrl
        videoName
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
export const postsByTeamId = /* GraphQL */ `
  query PostsByTeamId(
    $teamId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByTeamId(
      teamId: $teamId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        content
        imageUrl
        videoUrl
        videoName
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
export const commentsByPostId = /* GraphQL */ `
  query CommentsByPostId(
    $postId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    commentsByPostId(
      postId: $postId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
export const favoritesByTournamentId = /* GraphQL */ `
  query FavoritesByTournamentId(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelFavoriteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    favoritesByTournamentId(
      tournamentId: $tournamentId
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
export const favoritesByTeamId = /* GraphQL */ `
  query FavoritesByTeamId(
    $teamId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelFavoriteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    favoritesByTeamId(
      teamId: $teamId
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
export const tournamentTeamsByTournamentId = /* GraphQL */ `
  query TournamentTeamsByTournamentId(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTournamentTeamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tournamentTeamsByTournamentId(
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
export const tournamentTeamsByTeamId = /* GraphQL */ `
  query TournamentTeamsByTeamId(
    $teamId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTournamentTeamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tournamentTeamsByTeamId(
      teamId: $teamId
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
export const tournamentResultsByTournamentId = /* GraphQL */ `
  query TournamentResultsByTournamentId(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTournamentResultFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tournamentResultsByTournamentId(
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
        startDate
        endDate
        imageUrl
        pdfUrl
        pdfName
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
export const tournamentInvitationsByTournamentId = /* GraphQL */ `
  query TournamentInvitationsByTournamentId(
    $tournamentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTournamentInvitationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tournamentInvitationsByTournamentId(
      tournamentId: $tournamentId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        tournamentId
        tournamentName
        inviterEmail
        inviteeEmail
        status
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
        name
        slug
        regionId
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
        name
        slug
        regionId
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
        name
        prefectureId
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
