/* tslint:disable */
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
export const onCreateTournament = /* GraphQL */ `
  subscription OnCreateTournament(
    $filter: ModelSubscriptionTournamentFilterInput
  ) {
    onCreateTournament(filter: $filter) {
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
export const onUpdateTournament = /* GraphQL */ `
  subscription OnUpdateTournament(
    $filter: ModelSubscriptionTournamentFilterInput
  ) {
    onUpdateTournament(filter: $filter) {
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
export const onDeleteTournament = /* GraphQL */ `
  subscription OnDeleteTournament(
    $filter: ModelSubscriptionTournamentFilterInput
  ) {
    onDeleteTournament(filter: $filter) {
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
export const onCreateTeam = /* GraphQL */ `
  subscription OnCreateTeam($filter: ModelSubscriptionTeamFilterInput) {
    onCreateTeam(filter: $filter) {
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
export const onUpdateTeam = /* GraphQL */ `
  subscription OnUpdateTeam($filter: ModelSubscriptionTeamFilterInput) {
    onUpdateTeam(filter: $filter) {
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
export const onDeleteTeam = /* GraphQL */ `
  subscription OnDeleteTeam($filter: ModelSubscriptionTeamFilterInput) {
    onDeleteTeam(filter: $filter) {
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
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost($filter: ModelSubscriptionPostFilterInput) {
    onCreatePost(filter: $filter) {
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
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost($filter: ModelSubscriptionPostFilterInput) {
    onUpdatePost(filter: $filter) {
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
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost($filter: ModelSubscriptionPostFilterInput) {
    onDeletePost(filter: $filter) {
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
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment($filter: ModelSubscriptionCommentFilterInput) {
    onCreateComment(filter: $filter) {
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
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment($filter: ModelSubscriptionCommentFilterInput) {
    onUpdateComment(filter: $filter) {
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
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment($filter: ModelSubscriptionCommentFilterInput) {
    onDeleteComment(filter: $filter) {
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
export const onCreateFavorite = /* GraphQL */ `
  subscription OnCreateFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
    onCreateFavorite(filter: $filter) {
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
export const onUpdateFavorite = /* GraphQL */ `
  subscription OnUpdateFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
    onUpdateFavorite(filter: $filter) {
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
export const onDeleteFavorite = /* GraphQL */ `
  subscription OnDeleteFavorite($filter: ModelSubscriptionFavoriteFilterInput) {
    onDeleteFavorite(filter: $filter) {
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
export const onCreateFollow = /* GraphQL */ `
  subscription OnCreateFollow($filter: ModelSubscriptionFollowFilterInput) {
    onCreateFollow(filter: $filter) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateFollow = /* GraphQL */ `
  subscription OnUpdateFollow($filter: ModelSubscriptionFollowFilterInput) {
    onUpdateFollow(filter: $filter) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteFollow = /* GraphQL */ `
  subscription OnDeleteFollow($filter: ModelSubscriptionFollowFilterInput) {
    onDeleteFollow(filter: $filter) {
      id
      followerEmail
      followingEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateTournamentTeam = /* GraphQL */ `
  subscription OnCreateTournamentTeam(
    $filter: ModelSubscriptionTournamentTeamFilterInput
  ) {
    onCreateTournamentTeam(filter: $filter) {
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
export const onUpdateTournamentTeam = /* GraphQL */ `
  subscription OnUpdateTournamentTeam(
    $filter: ModelSubscriptionTournamentTeamFilterInput
  ) {
    onUpdateTournamentTeam(filter: $filter) {
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
export const onDeleteTournamentTeam = /* GraphQL */ `
  subscription OnDeleteTournamentTeam(
    $filter: ModelSubscriptionTournamentTeamFilterInput
  ) {
    onDeleteTournamentTeam(filter: $filter) {
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
export const onCreateTournamentResult = /* GraphQL */ `
  subscription OnCreateTournamentResult(
    $filter: ModelSubscriptionTournamentResultFilterInput
  ) {
    onCreateTournamentResult(filter: $filter) {
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
export const onUpdateTournamentResult = /* GraphQL */ `
  subscription OnUpdateTournamentResult(
    $filter: ModelSubscriptionTournamentResultFilterInput
  ) {
    onUpdateTournamentResult(filter: $filter) {
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
export const onDeleteTournamentResult = /* GraphQL */ `
  subscription OnDeleteTournamentResult(
    $filter: ModelSubscriptionTournamentResultFilterInput
  ) {
    onDeleteTournamentResult(filter: $filter) {
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
export const onCreateTournamentInvitation = /* GraphQL */ `
  subscription OnCreateTournamentInvitation(
    $filter: ModelSubscriptionTournamentInvitationFilterInput
  ) {
    onCreateTournamentInvitation(filter: $filter) {
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
export const onUpdateTournamentInvitation = /* GraphQL */ `
  subscription OnUpdateTournamentInvitation(
    $filter: ModelSubscriptionTournamentInvitationFilterInput
  ) {
    onUpdateTournamentInvitation(filter: $filter) {
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
export const onDeleteTournamentInvitation = /* GraphQL */ `
  subscription OnDeleteTournamentInvitation(
    $filter: ModelSubscriptionTournamentInvitationFilterInput
  ) {
    onDeleteTournamentInvitation(filter: $filter) {
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
export const onCreateRegion = /* GraphQL */ `
  subscription OnCreateRegion($filter: ModelSubscriptionRegionFilterInput) {
    onCreateRegion(filter: $filter) {
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
export const onUpdateRegion = /* GraphQL */ `
  subscription OnUpdateRegion($filter: ModelSubscriptionRegionFilterInput) {
    onUpdateRegion(filter: $filter) {
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
export const onDeleteRegion = /* GraphQL */ `
  subscription OnDeleteRegion($filter: ModelSubscriptionRegionFilterInput) {
    onDeleteRegion(filter: $filter) {
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
export const onCreatePrefecture = /* GraphQL */ `
  subscription OnCreatePrefecture(
    $filter: ModelSubscriptionPrefectureFilterInput
  ) {
    onCreatePrefecture(filter: $filter) {
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
export const onUpdatePrefecture = /* GraphQL */ `
  subscription OnUpdatePrefecture(
    $filter: ModelSubscriptionPrefectureFilterInput
  ) {
    onUpdatePrefecture(filter: $filter) {
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
export const onDeletePrefecture = /* GraphQL */ `
  subscription OnDeletePrefecture(
    $filter: ModelSubscriptionPrefectureFilterInput
  ) {
    onDeletePrefecture(filter: $filter) {
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
export const onCreateDistrict = /* GraphQL */ `
  subscription OnCreateDistrict($filter: ModelSubscriptionDistrictFilterInput) {
    onCreateDistrict(filter: $filter) {
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
export const onUpdateDistrict = /* GraphQL */ `
  subscription OnUpdateDistrict($filter: ModelSubscriptionDistrictFilterInput) {
    onUpdateDistrict(filter: $filter) {
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
export const onDeleteDistrict = /* GraphQL */ `
  subscription OnDeleteDistrict($filter: ModelSubscriptionDistrictFilterInput) {
    onDeleteDistrict(filter: $filter) {
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
