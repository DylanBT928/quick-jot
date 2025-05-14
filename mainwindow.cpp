#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent), ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    // load note
    QString notePath = QStandardPaths::writableLocation(QStandardPaths::DocumentsLocation) + "/QuickJot/";
    QFile file(notePath + "note.txt");
    if (file.open(QIODevice::ReadOnly))
    {
        QTextStream stream(&file);
        ui->noteEditor->setPlainText(stream.readAll());
    }

    // makes window stay on top
    connect(ui->pinButton, &QToolButton::toggled, this, [this](bool checked)
    {
        this->setWindowFlag(Qt::WindowStaysOnTopHint, checked);
        this->show();
    });
}

void MainWindow::closeEvent(QCloseEvent *event)
{
    // save note
    QString notePath = QStandardPaths::writableLocation(QStandardPaths::DocumentsLocation) + "/QuickJot/";
    QDir().mkpath(notePath);
    QFile file(notePath + "note.txt");
    if (file.open(QIODevice::WriteOnly))
    {
        QTextStream stream(&file);
        stream << ui->noteEditor->toPlainText();
    }

    QMainWindow::closeEvent(event);
}

MainWindow::~MainWindow() { delete ui; }
