class User {

  name;
  surname;
  dob;
  email;
  username;
  password;
  type;
  enabled;
  address;
  phone;

  constructor(person) {
    person.name !== undefined ? this.name = person.name : this.name = '';
    person.surname !== undefined ? this.surname = person.surname : this.surname = '';
    person.dob !== undefined ? this.dob = person.dob : this.dob = '';
    person.email !== undefined ? this.email = person.email : this.email = '';
    person.username !== undefined ? this.username = person.username : this.username = '';
    person.password !== undefined ? this.password = person.password : this.password = '';
    person.type !== undefined ? this.type = person.type : this.type = '';
    person.enabled !== undefined ? this.enabled = person.enabled : this.enabled = true;
    person.address !== undefined ? this.address = person.address : this.address = '';
    person.phone !== undefined ? this.phone = person.phone : this.phone = '';
  }

  createDocument() {
    let dataToSave = {
      name: this.name,
      surname: this.surname,
      dob: this.dob,
      email: this.email,
      username: this.username,
      password: this.password,
      type: this.type,
      enabled: this.enabled,
      address: this.address,
      phone: this.phone,

    }
    return dataToSave;
  }

} module.exports = User
