#include "mainwindow.h"

#include "./ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent), ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    // makes window stay on top
    connect(ui->checkBox, &QCheckBox::checkStateChanged, this, [this](int state)
    {
        bool topMost = (state == Qt::Checked);
        this->setWindowFlag(Qt::WindowStaysOnTopHint, topMost);
        this->show();
    });
}

MainWindow::~MainWindow() { delete ui; }

