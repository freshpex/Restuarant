export const getSerializableUser = (firebaseUser) => {
    if (!firebaseUser) return null;
    
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        lastLoginAt: firebaseUser.metadata?.lastLoginAt || null,
        createdAt: firebaseUser.metadata?.createdAt || null
    };
};

export const isUserDataValid = (userData) => {
    return userData && 
           typeof userData === 'object' && 
           'uid' in userData && 
           'email' in userData;
};
