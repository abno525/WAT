#include <iostream>
#include <vector>

using namespace std;

class PersonActions {
public:
    virtual void attend() = 0;

    virtual ~PersonActions() = default;
};

class CourseInfo {
public:
    virtual void info() = 0;

    virtual ~CourseInfo() = default;
};

class BuildingState {
public:
    virtual void open() = 0;
    virtual void close() = 0;

    virtual ~BuildingState() = default;
};

class Person : public PersonActions {
protected:
    string name;
    int age;
public:
    const string &getName() const {
        return name;
    }

    Person(const string &name, int age) : name(name), age(age) {
        this->name = name;
        this->age = age;
    }

    Person() {
        name = "";
        age = 0;
    }

    virtual ~Person() {
        cout << "Person destroyed\n";
    }

    void setName(const string &name) {
        Person::name = name;
    }

    int getAge() const {
        return age;
    }

    void setAge(int age) {
        this->age = age;
    }

    void attend() override {
        cout << "Person is attending\n";
    }
};

class Student : public Person {
protected:
    int yearOfStudy;
    int ects;
public:

    Student() {
        yearOfStudy = 0;
        ects = 0;
    }

    Student(const string &name, int age, int yearOfStudy, int ects) : Person(name, age), yearOfStudy(yearOfStudy),
                                                                      ects(ects) {
        this->yearOfStudy = yearOfStudy;
        this->ects = ects;
        this->name = name;
        this->age = age;
    }

    ~Student() override {
        cout << "Student destroyed\n";
    }

    int getYearOfStudy() const {
        return yearOfStudy;
    }

    void setYearOfStudy(int yearOfStudy) {
        this->yearOfStudy = yearOfStudy;
    }

    int getEcts() const {
        return ects;
    }

    void setEcts(int ects) {
        this->ects = ects;
    }

    void attend() override {
        cout << "Student is attending\n";
    }
};

class Teacher : public Person {
protected:
    string title;
    int salary;
public:

    Teacher() {
        title = "";
        salary = 0;
    }

    Teacher(const string &name, int age, const string &title) : Person(name, age), title(title) {
        this->title = title;
        this->salary = salary;
        this->name = name;
        this->age = age;
    }

    ~Teacher() override {
        cout << "Teacher destroyed\n";
    }

    const string &getTitle() const {
        return title;
    }

    void setTitle(const string &title) {
        this->title = title;
    }

    void attend() override {
        cout << "Teacher is attending\n";
    }
};

class Course : public CourseInfo {
protected:
    string name;
    int credits;
public:

    Course() {
        name = "";
        credits = 0;
    }

    Course(const string &name, int credits) : name(name), credits(credits) {
        this->name = name;
        this->credits = credits;
    }

    virtual ~Course() {
        cout << "Course destroyed\n";

    }

    const string &getName() const {
        return name;
    }

    void setName(const string &name) {
        this->name = name;
    }

    void info() override {
        cout << "Course info\n";
    }
};

class OnlineCourse : public Course {
protected:
    string link;
public:

    OnlineCourse() {
        link = "";
    }

    OnlineCourse(const string &name, int credits, const string &link) : Course(name, credits), link(link) {
        this->name = name;
        this->credits = credits;
        this->link = link;
    }

    ~OnlineCourse() override {
        cout << "OnlineCourse destroyed\n";
    }

    const string &getLink() const {
        return link;
    }

    void setLink(const string &link) {
        this->link = link;
    }

    void info() override {
        cout << "OnlineCourse info\n";
    }

};

class Building : public BuildingState {
protected:
    string name;
    string address;
public:

    Building() {
        name = "";
        address = "";
    }

    Building(const string &name, const string &address) : name(name), address(address) {}

    ~Building() {
        cout << "Building destroyed\n";
    }

    const string &getName() const {
        return name;
    }

    void setName(const string &name) {
        this->name = name;
    }

    const string &getAddress() const {
        return address;
    }

    void setAddress(const string &address) {
        this->address = address;
    }

    void open() override {
        cout << "Building is open\n";
    }
    void close() override {
        cout << "Building is closed\n";
    }
};

class Cantina : public Building {
protected:
    int dishes;
public:

    Cantina() {
        dishes = 0;
    }

     Cantina(int dishes) : dishes(dishes) {
        this->dishes = dishes;
    }

    Cantina(const string &name, const string &address, int dishes) : Building(name, address), dishes(dishes) {
        this->name = name;
        this->address = address;
        this->dishes = dishes;
    }

    ~Cantina() {
        cout << "Cantina destroyed\n";
    }

    int getDishes() const {
        return dishes;
    }

    void setDishes(int dishes) {
        Cantina::dishes = dishes;
    }

    void open() override {
        cout << "Cantina is open\n";
    }
    void close() override {
        cout << "Cantina is closed\n";
    }
};

class Lab : public Building {
protected:
    int computers;
public:

    Lab() {
        computers = 0;
    }

    Lab(int computers) : computers(computers) {
        this->computers = computers;
    }

    Lab(const string &name, const string &address, int computers) : Building(name, address), computers(computers) {
        this->name = name;
        this->address = address;
        this->computers = computers;
    }

    ~Lab() {
        cout << "Lab destroyed\n";
    }

    void open() override {
        cout << "Lab is open\n";
    }
    void close() override {
        cout << "Lab is closed\n";
    }
};

class University {
private:
    vector<PersonActions*> people;
    vector<CourseInfo*> courses;
    vector<BuildingState*> buildings;

public:
    University() {
        people = vector<PersonActions*>();
        courses = vector<CourseInfo*>();
        buildings = vector<BuildingState*>();
    }

    void addPerson(PersonActions* person) {
        people.push_back(person);
    }

    void addCourse(CourseInfo* course) {
        courses.push_back(course);
    }

    void addBuilding(BuildingState* building) {
        buildings.push_back(building);
    }

    ~University() {
        for (auto person : people) delete person;
        for (auto course : courses) delete course;
        for (auto building : buildings) delete building;
    }

    void attendClasses() {
        for (auto person : people) person->attend();
    }

    void courseInfo() {
        for (auto course : courses) course->info();
    }

    void buildingStatus() {
        for (auto building : buildings) {
            building->open();
            building->close();
        }
    }


};

int main() {

    auto* student = new Student("Jane", 22, 3, 90);
    auto* teacher = new Teacher("Dr. Johnson", 50, "Professor");
    auto* course = new Course("Course", 4);
    auto* onlineCourse = new OnlineCourse("Online Course 2", 5, "www.onlinecourse2.com");
    auto* building = new Building("Building", "234 Street");
    auto* cantina = new Cantina("Cantina", "567 Street", 6);
    auto* lab = new Lab("Lab", "890 Street", 20);

    auto* uni = new University();
    uni->addPerson(student);
    uni->addPerson(teacher);
    uni->addCourse(course);
    uni->addCourse(onlineCourse);
    uni->addBuilding(building);
    uni->addBuilding(cantina);
    uni->addBuilding(lab);

    cout << "\nUniversity functions:\n";
    uni->attendClasses();
    uni->courseInfo();
    uni->buildingStatus();

    cout << "\nDeletion of uni:\n";
    delete uni;

    return 0;
}
