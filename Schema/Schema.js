const axios = require('axios');
const graphql = require('graphql');
//const _ = require('loadsh');

const{
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

/*const users = [
    { id: '23', firstName: 'Bill', age: 20},
    { id: '34', firstName: 'Ron', age: 19}
]; Static list of users*/

const CompanyType =new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString},
        name: { type: GraphQLString},
        description: { type: GraphQLString},
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(resp => resp.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: graphql.GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt},
        company: {
            type: CompanyType,
            resolve(parentValue, args) {            // helps fetch companies associated with the user
                //console.log(parentValue, args); out in graphiQL COMPANY:null
                //{ id: '34', firstName: 'Ron', age: 19, companyId: '2' } {}
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(resp => resp.data);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString}},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    //.then(response => console.log(response)) // {data{firstName: 'bill'}}
                    .then(resp => resp.data)
                    //to make graphql and json work together
                    // they only see the data 
                    
                }  
        },
        company: {
            type: CompanyType,
            args: {id: {type: GraphQLString}},
        resolve(parentValue,args) {
            return axios.get(`http://localhost:3000/companies/${args.id}`)
                .then(resp => resp.data);
        }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {//operation add user
            type: UserType ,// the type which we expect it to retuen
            args: {
                firstName: { type:new GraphQLNonNull(GraphQLString)},//Cannot be null
                age: {type: GraphQLNonNull(GraphQLInt)},
                companyId: { type: GraphQLString}
            },
            resolve(parentValue, { firstName, age }){
                return axios.post('http://localhost:3000/users',{ firstName, age })
                    .then(res => res.data);
            }       
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                
            },
            resolve(parentValue, { id }){
                return axios.delete(`http://localhost:3000/users/${ id }`)
                .then(res => res.data);
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: GraphQLString},
                firstName: {type: GraphQLString},
                age: {type: GraphQLInt},
                companyId: {type: GraphQLString}
                
            },
            resolve(parentValue, args){
                //return axios.put(`http://localhost:3000/users/${args.id}`, args) replace everything and fills the given values while the other are set to null
                return axios.put(`http://localhost:3000/users/${args.id}`, args)// replaces only the specified fields
                    .then(res => res.data);
            }
        }
    } 
});



module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});
