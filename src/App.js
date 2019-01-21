import React, { Component } from 'react';
import './App.css';
import { Col, Row, Container, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { API_KEY } from './config';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      people: [],
      nextId: 1
    };

    this.onChange = this.onChange.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addPersonToDynamo = this.addPersonToDynamo.bind(this);
    this.getAllPeopleFromDynamo = this.getAllPeopleFromDynamo.bind(this);
    this.deletePerson = this.deletePerson.bind(this);
  }

  deletePerson(deleteId) {

    console.log("Deleting person with id: " + deleteId);

    fetch('https://csemuxerv5.execute-api.us-east-1.amazonaws.com/devo/delete', {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Method": "DELETE",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        id: deleteId
      })
    });

    let people = this.state.people.filter(curPerson => curPerson.id !== deleteId);

    let nextId = this.state.nextId;

    if (people.length === 0) {
      nextId = 1;
      console.log('The nextId is 0!');
    }

    this.setState({
      people,
      nextId
    });
  }

  componentDidMount() {
    this.getAllPeopleFromDynamo();
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  addPersonToDynamo() {
    fetch('https://csemuxerv5.execute-api.us-east-1.amazonaws.com/devo/post', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Method": "DELETE",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({
        id: this.state.nextId,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
      })
    })
  }

  getAllPeopleFromDynamo() {
    console.log("Getting everyone");
    fetch('https://csemuxerv5.execute-api.us-east-1.amazonaws.com/devo/get', {
      method: 'GET',
      headers: {
        "x-api-key": API_KEY
      }
    })
      .then(data => data.json())
      .then((data) => {
        let nextId = 1;

        if (data.Items.length !== 0) {
          console.log("Inside if");
          nextId = Math.max.apply(Math, data.Items.map(function (curPerson) { return curPerson.id })) + 1;
        }
        let allPeople = data.Items;

        console.log("The next person's id is " + nextId);
        this.setState({
          people: allPeople,
          nextId: nextId
        });
      });

    console.log("Next person's Id: " + this.state.nextId);
  }

  addPerson() {
    if (this.state.firstName && this.state.lastName) {
      let newPeople = this.state.people;
      let personId = this.state.nextId;
      newPeople.push({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        id: personId
      });

      this.addPersonToDynamo();

      this.setState({
        people: newPeople,
        nextId: personId + 1
      });

      console.log(JSON.stringify({
        id: this.state.nextId,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
      }));
    }
  }

  render() {
    return (
      <Container>
        <div className="App">
          <h1>Welcome to my application</h1>
          <br />
          <br />
          <h2> Please fill in your information below </h2>
          <br />
          <br />
          <Form>
            <Row form>
              <Col md={{ size: 3, offset: 3 }}>
                <FormGroup>
                  <Label for="firstName">First Name</Label>
                  <Input type="text" name="firstName" id="firstName" placeholder="Enter your first name" onChange={this.onChange} value={this.state.firstName} />
                </FormGroup>
              </Col>
              <Col md={{ size: 3 }}>
                <FormGroup>
                  <Label for="lastName">Last Name</Label>
                  <Input type="text" name="lastName" id="lastName" onChange={this.onChange} placeholder="Enter your last name" />
                </FormGroup>
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={{ size: 4, offset: 4 }}>
                <Button color="primary" onClick={this.addPerson}>Add Person</Button>
              </Col>
            </Row>
          </Form>
          <br />
          <br />
          <h1>People who've filled the form</h1>
          <br />
          <br />
          {
            this.state.people.sort(function (a, b) {
              return a.id - b.id;
            }).map((curPerson, index) => {
              return (
                <div key={curPerson.id}>
                  <Row>
                    <Col md={{ size: 1, offset: 2 }}>
                      <Button color="warning" disabled>{curPerson.id}</Button>
                    </Col>
                    <Col md={{ size: 3 }}>
                      <ListGroup>
                        <ListGroupItem color="info">{curPerson.firstName}</ListGroupItem>
                      </ListGroup>
                    </Col>
                    <Col md={{ size: 3 }}>
                      <ListGroup>
                        <ListGroupItem color="info">{curPerson.lastName}</ListGroupItem>
                      </ListGroup>
                    </Col>
                    <Col md={{ size: 3 }}>
                      <Button color="danger" onClick={() => this.deletePerson(curPerson.id)}>Remove this person</Button>
                    </Col>
                  </Row>
                  <br />
                </div>
              )
            })
          }
        </div>
      </Container>
    );
  }
}

export default App;
