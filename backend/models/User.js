import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @description: This is the schema for the User model.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is authenticated.
 * @throws {Error} - An error if the user is not authenticated.
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email ist erforderlich'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Bitte eine gültige Email-Adresse eingeben']
    },
    password: {
        type: String,
        required: [true, 'Passwort ist erforderlich'],
        minlength: [8, 'Passwort muss mindestens 8 Zeichen lang sein']
    },
    name: {
        type: String,
        required: [true, 'Name ist erforderlich'],
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

/**
 * @description: This is the pre-save hook to hash the password.
 * @param {Object} next - The next function.
 * @returns {Promise<void>} - A promise that resolves when the password is hashed.
 * @throws {Error} - An error if the password is not hashed.
 */
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * @description: This is the method to compare the password.
 * @param {Object} candidatePassword - The candidate password.
 * @returns {Promise<boolean>} - A promise that resolves when the password is compared.
 * @throws {Error} - An error if the password is not compared.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * @description: This is the method to remove the password from the JSON.
 * @returns {Object} - The user object without the password.
 * @throws {Error} - An error if the password is not removed.
 */
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User; 