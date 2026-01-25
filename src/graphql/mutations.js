/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTournament = /* GraphQL */ `
  mutation CreateTournament(
    $input: CreateTournamentInput!
    $condition: ModelTournamentConditionInput
  ) {
    createTournament(input: $input, condition: $condition) {
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
export const updateTournament = /* GraphQL */ `
  mutation UpdateTournament(
    $input: UpdateTournamentInput!
    $condition: ModelTournamentConditionInput
  ) {
    updateTournament(input: $input, condition: $condition) {
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
export const deleteTournament = /* GraphQL */ `
  mutation DeleteTournament(
    $input: DeleteTournamentInput!
    $condition: ModelTournamentConditionInput
  ) {
    deleteTournament(input: $input, condition: $condition) {
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
export const createTeam = /* GraphQL */ `
  mutation CreateTeam(
    $input: CreateTeamInput!
    $condition: ModelTeamConditionInput
  ) {
    createTeam(input: $input, condition: $condition) {
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
export const updateTeam = /* GraphQL */ `
  mutation UpdateTeam(
    $input: UpdateTeamInput!
    $condition: ModelTeamConditionInput
  ) {
    updateTeam(input: $input, condition: $condition) {
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
export const deleteTeam = /* GraphQL */ `
  mutation DeleteTeam(
    $input: DeleteTeamInput!
    $condition: ModelTeamConditionInput
  ) {
    deleteTeam(input: $input, condition: $condition) {
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
export const createPost = /* GraphQL */ `
  mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
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
export const updatePost = /* GraphQL */ `
  mutation UpdatePost(
    $input: UpdatePostInput!
    $condition: ModelPostConditionInput
  ) {
    updatePost(input: $input, condition: $condition) {
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
export const deletePost = /* GraphQL */ `
  mutation DeletePost(
    $input: DeletePostInput!
    $condition: ModelPostConditionInput
  ) {
    deletePost(input: $input, condition: $condition) {
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
export const createComment = /* GraphQL */ `
  mutation CreateComment(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
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
export const updateComment = /* GraphQL */ `
  mutation UpdateComment(
    $input: UpdateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    updateComment(input: $input, condition: $condition) {
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
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment(
    $input: DeleteCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    deleteComment(input: $input, condition: $condition) {
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
export const createLike = /* GraphQL */ `
  mutation CreateLike(
    $input: CreateLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    createLike(input: $input, condition: $condition) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateLike = /* GraphQL */ `
  mutation UpdateLike(
    $input: UpdateLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    updateLike(input: $input, condition: $condition) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteLike = /* GraphQL */ `
  mutation DeleteLike(
    $input: DeleteLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    deleteLike(input: $input, condition: $condition) {
      id
      postId
      userEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createFavorite = /* GraphQL */ `
  mutation CreateFavorite(
    $input: CreateFavoriteInput!
    $condition: ModelFavoriteConditionInput
  ) {
    createFavorite(input: $input, condition: $condition) {
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
export const updateFavorite = /* GraphQL */ `
  mutation UpdateFavorite(
    $input: UpdateFavoriteInput!
    $condition: ModelFavoriteConditionInput
  ) {
    updateFavorite(input: $input, condition: $condition) {
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
export const deleteFavorite = /* GraphQL */ `
  mutation DeleteFavorite(
    $input: DeleteFavoriteInput!
    $condition: ModelFavoriteConditionInput
  ) {
    deleteFavorite(input: $input, condition: $condition) {
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
export const createFollow = /* GraphQL */ `
  mutation CreateFollow(
    $input: CreateFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    createFollow(input: $input, condition: $condition) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateFollow = /* GraphQL */ `
  mutation UpdateFollow(
    $input: UpdateFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    updateFollow(input: $input, condition: $condition) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteFollow = /* GraphQL */ `
  mutation DeleteFollow(
    $input: DeleteFollowInput!
    $condition: ModelFollowConditionInput
  ) {
    deleteFollow(input: $input, condition: $condition) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createTournamentTeam = /* GraphQL */ `
  mutation CreateTournamentTeam(
    $input: CreateTournamentTeamInput!
    $condition: ModelTournamentTeamConditionInput
  ) {
    createTournamentTeam(input: $input, condition: $condition) {
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
export const updateTournamentTeam = /* GraphQL */ `
  mutation UpdateTournamentTeam(
    $input: UpdateTournamentTeamInput!
    $condition: ModelTournamentTeamConditionInput
  ) {
    updateTournamentTeam(input: $input, condition: $condition) {
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
export const deleteTournamentTeam = /* GraphQL */ `
  mutation DeleteTournamentTeam(
    $input: DeleteTournamentTeamInput!
    $condition: ModelTournamentTeamConditionInput
  ) {
    deleteTournamentTeam(input: $input, condition: $condition) {
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
export const createTournamentResult = /* GraphQL */ `
  mutation CreateTournamentResult(
    $input: CreateTournamentResultInput!
    $condition: ModelTournamentResultConditionInput
  ) {
    createTournamentResult(input: $input, condition: $condition) {
      id
      tournamentId
      year
      title
      content
      ranking
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
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const updateTournamentResult = /* GraphQL */ `
  mutation UpdateTournamentResult(
    $input: UpdateTournamentResultInput!
    $condition: ModelTournamentResultConditionInput
  ) {
    updateTournamentResult(input: $input, condition: $condition) {
      id
      tournamentId
      year
      title
      content
      ranking
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
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const deleteTournamentResult = /* GraphQL */ `
  mutation DeleteTournamentResult(
    $input: DeleteTournamentResultInput!
    $condition: ModelTournamentResultConditionInput
  ) {
    deleteTournamentResult(input: $input, condition: $condition) {
      id
      tournamentId
      year
      title
      content
      ranking
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
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const createTournamentInvitation = /* GraphQL */ `
  mutation CreateTournamentInvitation(
    $input: CreateTournamentInvitationInput!
    $condition: ModelTournamentInvitationConditionInput
  ) {
    createTournamentInvitation(input: $input, condition: $condition) {
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
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const updateTournamentInvitation = /* GraphQL */ `
  mutation UpdateTournamentInvitation(
    $input: UpdateTournamentInvitationInput!
    $condition: ModelTournamentInvitationConditionInput
  ) {
    updateTournamentInvitation(input: $input, condition: $condition) {
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
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const deleteTournamentInvitation = /* GraphQL */ `
  mutation DeleteTournamentInvitation(
    $input: DeleteTournamentInvitationInput!
    $condition: ModelTournamentInvitationConditionInput
  ) {
    deleteTournamentInvitation(input: $input, condition: $condition) {
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
        createdAt
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
export const createRegion = /* GraphQL */ `
  mutation CreateRegion(
    $input: CreateRegionInput!
    $condition: ModelRegionConditionInput
  ) {
    createRegion(input: $input, condition: $condition) {
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
export const updateRegion = /* GraphQL */ `
  mutation UpdateRegion(
    $input: UpdateRegionInput!
    $condition: ModelRegionConditionInput
  ) {
    updateRegion(input: $input, condition: $condition) {
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
export const deleteRegion = /* GraphQL */ `
  mutation DeleteRegion(
    $input: DeleteRegionInput!
    $condition: ModelRegionConditionInput
  ) {
    deleteRegion(input: $input, condition: $condition) {
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
export const createPrefecture = /* GraphQL */ `
  mutation CreatePrefecture(
    $input: CreatePrefectureInput!
    $condition: ModelPrefectureConditionInput
  ) {
    createPrefecture(input: $input, condition: $condition) {
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
export const updatePrefecture = /* GraphQL */ `
  mutation UpdatePrefecture(
    $input: UpdatePrefectureInput!
    $condition: ModelPrefectureConditionInput
  ) {
    updatePrefecture(input: $input, condition: $condition) {
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
export const deletePrefecture = /* GraphQL */ `
  mutation DeletePrefecture(
    $input: DeletePrefectureInput!
    $condition: ModelPrefectureConditionInput
  ) {
    deletePrefecture(input: $input, condition: $condition) {
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
export const createDistrict = /* GraphQL */ `
  mutation CreateDistrict(
    $input: CreateDistrictInput!
    $condition: ModelDistrictConditionInput
  ) {
    createDistrict(input: $input, condition: $condition) {
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
export const updateDistrict = /* GraphQL */ `
  mutation UpdateDistrict(
    $input: UpdateDistrictInput!
    $condition: ModelDistrictConditionInput
  ) {
    updateDistrict(input: $input, condition: $condition) {
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
export const deleteDistrict = /* GraphQL */ `
  mutation DeleteDistrict(
    $input: DeleteDistrictInput!
    $condition: ModelDistrictConditionInput
  ) {
    deleteDistrict(input: $input, condition: $condition) {
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
